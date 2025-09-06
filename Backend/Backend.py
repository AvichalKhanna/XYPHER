import asyncio
import json
import random
import time
import threading
import os
import numpy as np
import torch
from threading import Lock
import pyaudio
import pygame
from vosk import Model, KaldiRecognizer
from flask import Flask, request, jsonify
import keys  # ELEVEN API KEY stored here
import logging
from collections import deque
import requests

# ---------------- GLOBAL VARIABLES ----------------
is_speaking = False
speaking_lock = Lock()
tts_enabled = True  # TTS toggle state

# ---------------- CONFIG ----------------
VOSK_MODEL_PATH = r"D:\LOCALDOWNLOAD\vosk-model-en-in-0.5\vosk-model-en-in-0.5"
VOICE_NAME = "en-GB-LibbyNeural"
USE_ELEVENLABS = False
ELEVEN_API_KEY = keys.elevenlabskey
ELEVEN_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"
CHUNK_SIZE = 4096
MAX_CONTEXT_LEN = 10

# ---------------- SELECT AI MODE ----------------
USE_GEMINI = False  # True = Gemini, False = Transformers

# ---------------- LOGGING ----------------
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ---------------- AI STATUS ----------------
ai_status = {"aiState": "idle", "currentText": "", "mood": "neutral"}
ai_status_lock = Lock()
frontend_voice_mode = False
conversation_context = deque(maxlen=MAX_CONTEXT_LEN)

# ---------------- IMPORT BOTH MODULES ----------------
# Transformers
try:
    from sentence_transformers import SentenceTransformer, util
    with open(r"C:\Users\Lenovo\Desktop\Tony_Stark\CODE\PROJECTS\Xypher\Backend\polite_1000_intents.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    intent_map = {item["query"]: item["response"] for item in data}
    query_bank = list(intent_map.keys())
    model = SentenceTransformer(r"C:\Users\Lenovo\Desktop\Tony_Stark\CODE\PROJECTS\Xypher\fast_semantic_bot_polite", device="cpu")
    query_embeddings = model.encode(query_bank, convert_to_tensor=True)
    logger.info("Transformers model loaded successfully")
except Exception as e:
    logger.error(f"Failed to load transformers model: {e}")
    # Create fallback responses
    intent_map = {"fallback": ["I'm here to listen. How are you feeling today?", 
                              "Tell me more about what's on your mind.",
                              "I understand. Would you like to talk about it?"]}
    query_bank = list(intent_map.keys())
    query_embeddings = None

# Gemini - Only load if needed
gemini_model = None
if USE_GEMINI:
    try:
        import google.generativeai as genai
        genai.configure(api_key=keys.genai_api_key)
        gemini_model = genai.GenerativeModel("gemini-1.5-flash")
        logger.info("Gemini model loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load Gemini model: {e}")
        USE_GEMINI = False

# ---------------- RESPONSE HANDLERS ----------------
def generate_response_neural(text):
    try:
        query_embed = model.encode(text, convert_to_tensor=True)
        similarities = util.cos_sim(query_embed, query_embeddings)
        top_match_idx = torch.topk(similarities[0], 1).indices[0]
        matched_query = query_bank[top_match_idx]
        reply = random.choice(intent_map[matched_query])
        mood = random.choice(["happy", "neutral", "alert", "calm"])
        return reply, mood
    except Exception as e:
        logger.error(f"Neural response error: {e}")
        return "I'm having trouble understanding. Could you rephrase that?", "neutral"

def generate_response_gemini(user_text):
    try:
        # Define context for the AI therapist
        therapist_context = (
            "You are a compassionate, professional AI therapist helping people with depression, "
            "anxiety, or stress. Respond politely, concisely, and clearly, using simple language. "
            "Keep answers empathetic, supportive, and brief, no more than 30-40 words. "
            "Try to keep all the responses as brief as possible, try to make it no longer than a single line or 10-15 words, in extreme cases you can extend to 30"
            "Your goal is to help the user feel understood, provide guidance, and encourage positive actions."
        )

        # Combine context with user input
        prompt = f"{therapist_context}\n\nUser: {user_text}\nAI Therapist:"

        # Generate response
        response = gemini_model.generate_content(prompt)

        # Randomly assign mood for frontend display
        mood = random.choice(["happy", "neutral", "alert", "calm"])
        
        return response.text, mood
    except Exception as e:
        logger.error(f"Gemini response error: {e}")
        return "I'm experiencing some technical difficulties. Please try again.", "neutral"

def generate_response(text, use_tts=True):
    with ai_status_lock:
        ai_status.update({"aiState": "thinking"})
    
    try:
        if USE_GEMINI and gemini_model:
            reply, mood = generate_response_gemini(text)
        else:
            reply, mood = generate_response_neural(text)
            
        # REMOVE THIS PART - it's causing the issue
        # if tts_enabled :
        #     # Convert to speech
        #     tts_thread = threading.Thread(target=tts_thread_loop, args=(reply,), daemon=True)
        #     tts_thread.start()
        #             
        #     # Wait for TTS to complete
        #     tts_thread.join(timeout=10)

    except Exception as e:
        logger.error(f"Response generation error: {e}")
        reply, mood = "Sorry, I couldn't generate a response.", "neutral"

    conversation_context.append({"user": text, "ai": reply})

    # Only speak if TTS is enabled AND use_tts parameter is True
    if use_tts and tts_enabled:
        # Update status to speaking
        with ai_status_lock:
            ai_status.update({"aiState": "speaking", "currentText": reply, "mood": mood})
        
        # Convert to speech
        tts_thread = threading.Thread(target=tts_thread_loop, args=(reply,), daemon=True)
        tts_thread.start()
    else:
        # Still update status but don't speak
        with ai_status_lock:
            ai_status.update({"aiState": "speaking", "currentText": reply, "mood": mood})
        # Set a timer to return to idle state
        threading.Timer(2.0, lambda: ai_status_lock and ai_status.update({"aiState": "idle"})).start()
    
    return reply, mood

# ---------------- TTS ----------------
async def speak_streamed_text(text):
    global is_speaking
    
    try:
        # Set speaking state
        with speaking_lock:
            is_speaking = True
        
        if USE_ELEVENLABS:
            url = f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVEN_VOICE_ID}"
            headers = {
                "xi-api-key": ELEVEN_API_KEY, 
                "Content-Type": "application/json",
                "Accept": "audio/mpeg"
            }
            data = {
                "text": text, 
                "voice_settings": {
                    "stability": 0.75, 
                    "similarity_boost": 0.85
                }
            }
            
            response = requests.post(url, json=data, headers=headers, timeout=30)
            
            if response.status_code == 200:
                with open("temp_voice.mp3", "wb") as f:
                    f.write(response.content)
                
                pygame.mixer.music.load("temp_voice.mp3")
                pygame.mixer.music.play()
                while pygame.mixer.music.get_busy():
                    await asyncio.sleep(0.05)
                pygame.mixer.music.unload()
                os.remove("temp_voice.mp3")
            else:
                logger.error(f"ElevenLabs API error: {response.status_code} - {response.text}")
                # Fall back to edge-tts if ElevenLabs fails
                await fallback_tts(text)
                
        else:
            await fallback_tts(text)
            
    except Exception as e:
        logger.error(f"TTS error: {e}")
        # Try fallback TTS
        try:
            await fallback_tts(text)
        except Exception as fallback_error:
            logger.error(f"Fallback TTS also failed: {fallback_error}")
    finally:
        # Reset speaking state
        with speaking_lock:
            is_speaking = False
        
        # Reset status after speaking
        with ai_status_lock:
            ai_status.update({"aiState": "idle"})

async def fallback_tts(text):
    """Fallback TTS using edge-tts"""
    try:
        import edge_tts
        communicate = edge_tts.Communicate(text, VOICE_NAME)
        await communicate.save("temp_voice.mp3")
        
        pygame.mixer.music.load("temp_voice.mp3")
        pygame.mixer.music.play()
        while pygame.mixer.music.get_busy():
            await asyncio.sleep(0.05)
        pygame.mixer.music.unload()
        os.remove("temp_voice.mp3")
    except Exception as e:
        logger.error(f"Fallback TTS error: {e}")
        raise e

def tts_thread_loop(text):
    asyncio.run(speak_streamed_text(text))

def summarize_conversation():
    """
    Summarizes the current conversation history with insights.
    Returns a concise, actionable summary string with:
      - User mood/emotions
      - Problems discussed
      - AI challenges
      - Suggestions/advice
    """
    if not conversation_context:
        return "No conversation history yet."

    # Build conversation text
    convo_text = "\n".join(
        [f"User: {item['user']}\nAI: {item['ai']}" for item in conversation_context]
    )

    # Define AI summarizer prompt
    summarizer_prompt = (
        "You are a highly skilled AI therapist and conversation analyst. "
        "Summarize the following conversation between a user and an AI. "
        "Your summary must be concise, polite, and actionable. Include:\n"
        "1. User mood and emotional state.\n"
        "2. Problems or concerns expressed.\n"
        "3. Challenges or limitations the AI faced.\n"
        "4. Suggestions or guidance for the user.\n"
        "5. Overall tone and key takeaways.\n"
        "Keep the summary under 150 words. Use clear, simple, empathetic language.\n\n"
        f"Conversation:\n{convo_text}\n\nSummary:"
    )

    try:
        if USE_GEMINI:
            # Use Gemini for rich summarization
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(summarizer_prompt)
            summary = response.text.strip()
        else:
            print("Transformers Summary Requested")
            # Transformers semantic fallback: extract key sentences
            combined_text = " ".join([item["ai"] for item in conversation_context])
            # Use simple heuristics for insights
            # Mood estimation based on keywords
            mood_keywords = ["sad", "happy", "anxious", "stressed", "angry", "calm"]
            detected_moods = [word for word in mood_keywords if word in combined_text.lower()]
            detected_moods = detected_moods[:2] if detected_moods else ["neutral"]

            # Problems & suggestions
            user_msgs = " ".join([item["user"] for item in conversation_context])
            problem_snippet = user_msgs[:150] + "..." if len(user_msgs) > 150 else user_msgs

            summary = (
                f"User mood: {', '.join(detected_moods)}. "
                f"Key concerns: {problem_snippet}. "
                f"AI challenges: Understanding nuanced emotions. "
                f"Suggestions: Provide support, encouragement, and coping strategies."
            )
    except Exception as e:
        print("[SUMMARY ERROR]", e)
        summary = "Unable to generate summary at this time."

    return summary

# ---------------- VOICE INPUT THREAD ----------------
def voice_input_thread():
    global frontend_voice_mode, is_speaking
    
    try:
        model_stt = Model(VOSK_MODEL_PATH)
        mic = pyaudio.PyAudio()
        
        logger.info("Voice input thread started - Ready for voice input")
        
        # Initialize microphone but don't start reading yet
        stream = None
        
        while True:
            # Only process voice input when voice mode is enabled AND not currently speaking
            with speaking_lock:
                speaking = is_speaking
                
            if not frontend_voice_mode or speaking:
                time.sleep(0.1)
                continue
                
            # Initialize stream if not already done
            if stream is None:
                stream = mic.open(
                    format=pyaudio.paInt16, 
                    channels=1, 
                    rate=16000, 
                    input=True, 
                    frames_per_buffer=CHUNK_SIZE
                )
                stream.start_stream()
                logger.info("Microphone stream started")
            
            try:
                # Check if we should still be listening
                with speaking_lock:
                    if is_speaking:
                        continue
                
                # Read audio data
                data = stream.read(CHUNK_SIZE, exception_on_overflow=False)
                
                # Create recognizer for this chunk
                rec = KaldiRecognizer(model_stt, 16000)
                
                if rec.AcceptWaveform(data):
                    result = json.loads(rec.Result())
                    text = result.get("text", "").strip()
                    
                    if text:
                        logger.info(f"Voice input detected: {text}")
                        
                        # Immediately send transcription to frontend
                        with ai_status_lock:
                            ai_status.update({
                                "aiState": "processing", 
                                "currentText": f"User said: {text}",
                                "mood": "neutral"
                            })

                        logger.info(f"You said: {text}")
                        
                        # JUST call generate_response - it will handle TTS and status updates automatically
                        reply, mood = generate_response(text, tts_enabled)
                        # The generate_response function will handle everything else
                
            except Exception as e:
                logger.error(f"Voice processing error: {e}")
                time.sleep(0.1)
                
    except Exception as e:
        logger.error(f"Voice input thread error: {e}")
    finally:
        if stream:
            stream.stop_stream()
            stream.close()
        if mic:
            mic.terminate()

# ---------------- FLASK API ----------------
app = Flask(__name__)

@app.route("/api/user-action", methods=["POST"])
def user_action():
    global frontend_voice_mode, tts_enabled
    try:
        data = request.get_json()
        if not data:
            return jsonify({"status": "error", "message": "No JSON data provided"})
        
        action = data.get("action")
        
        if action == "send_message":
            text = data.get("text", "")
            use_tts = data.get("ttsEnabled", tts_enabled)  # Use provided setting or default
            if text:
                reply, mood = generate_response(text, use_tts)
                return jsonify({"status": "ok", "data": {"reply": reply, "mood": mood}})
            else:
                return jsonify({"status": "error", "message": "No text provided"})
                
        elif action == "toggle_voice_mode":
            frontend_voice_mode = bool(data.get("voiceMode", False))
            return jsonify({"status": "ok", "data": {"voiceMode": frontend_voice_mode}})
            
        elif action == "set_chat_mode":
            mode = "gemini" if USE_GEMINI else "neural"
            return jsonify({"status": "ok", "data": {"chatMode": mode}})
            
        elif action == "set_tts_enabled":
            tts_enabled = bool(data.get("ttsEnabled", True))
            logger.info(f"TTS enabled: {tts_enabled}")
            return jsonify({"status": "ok", "data": {"ttsEnabled": tts_enabled}})
            
        else:
            return jsonify({"status": "error", "message": "Invalid action"})
            
    except Exception as e:
        logger.error(f"User action error: {e}")
        return jsonify({"status": "error", "message": str(e)})

@app.route("/api/conversation-summary", methods=["GET"])
def conversation_summary():
    summary = summarize_conversation()
    return jsonify({"status": "ok", "data": {"summary": summary}})

@app.route("/api/ai-status", methods=["GET"])
def get_ai_status():
    with ai_status_lock:
        return jsonify({"status": "ok", "data": ai_status})

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "ok", 
        "data": {
            "status": "healthy",
            "timestamp": time.time(),
            "chat_mode": "gemini" if USE_GEMINI else "neural",
            "voice_mode": frontend_voice_mode,
            "tts_enabled": tts_enabled
        }
    })

# ---------------- MAIN ----------------
if __name__ == "__main__":
    # Initialize pygame mixer once
    pygame.mixer.init()
    
    # Start voice input thread
    threading.Thread(target=voice_input_thread, daemon=True).start()
    
    # Start Flask app
    logger.info("Starting Flask server...")
    app.run(host="0.0.0.0", port=5000, debug=False, threaded=True)
