from multiprocessing import Process, Queue
import asyncio
import threading
import time
import os
import json
import pyaudio
import pygame
from vosk import Model, KaldiRecognizer
import edge_tts
from difflib import get_close_matches
from sentence_transformers import SentenceTransformer, util
from torch import topk
import json
import random 


from vosk import Model

try:
    model = Model(r"D:\LOCALDOWNLOAD\vosk-model-en-in-0.5\vosk-model-en-in-0.5")
    print("Vosk model loaded successfully!")
except Exception as e:
    print("Failed to load Vosk model:", e)


# --------------------------- CONFIG ---------------------------
VOSK_MODEL_PATH = r"D:\LOCALDOWNLOAD\vosk-model-en-in-0.5\vosk-model-en-in-0.5"
VOICE_NAME = "en-GB-LibbyNeural"

def stt_process(q_out):
    # ✅ Ensure model exists

    rec = KaldiRecognizer(model, 16000)
    mic = pyaudio.PyAudio()

    stream = mic.open(
        format=pyaudio.paInt16,
        channels=1,
        rate=16000,
        input=True,
        frames_per_buffer=8000
    )
    stream.start_stream()

    last_partial = ""
    while True:
        data = stream.read(4000, exception_on_overflow=False)
        if rec.AcceptWaveform(data):
            result = json.loads(rec.Result())
            text = result.get("text", "").strip()
            if text:
                print("Heard:", text)
                q_out.put({"text": text, "timestamp": time.time()})
        else:
            partial_result = json.loads(rec.PartialResult())
            partial = partial_result.get("partial", "").strip()
            if partial and partial != last_partial and len(partial.split()) >= 2:
                last_partial = partial
                q_out.put({"text": partial, "timestamp": time.time(), "partial": True})

def logic_process(q_in, q_out):
    # ✅ Load the fine-tuned model
    model = SentenceTransformer(r"Backend\fast_semantic_bot_polite", device="cpu")

    # ✅ Load intents
    with open(r"Backend\Data\polite_1000_intents.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    # ✅ Create query → responses map
    intent_map = {}  # {query: [responses]}
    for item in data:
        intent_map[item["query"]] = item["response"]

    # ✅ Prepare embeddings for all queries
    query_bank = list(intent_map.keys())
    query_embeddings = model.encode(query_bank, convert_to_tensor=True)

    # ✅ Loop and handle inputs
    while True:
        if not q_in.empty():
            user_query = q_in.get()
            if user_query.get("partial"):
                continue

            query_text = user_query["text"]
            query_embed = model.encode(query_text, convert_to_tensor=True)

            # ✅ Find most similar query in the bank
            similarities = util.cos_sim(query_embed, query_embeddings)
            top_match_idx = topk(similarities[0], 1).indices[0]
            matched_query = query_bank[top_match_idx]

            # ✅ Pick a random response from the matched query
            reply = random.choice(intent_map[matched_query])

            # ✅ Output
            print("response : ", reply)
            q_out.put({"text": reply, "timestamp": user_query["timestamp"]})

# --------------------------- TTS Process ---------------------------
async def speak_streamed_text(text):
    try:
        
        communicate = edge_tts.Communicate(text, VOICE_NAME)
        gen = communicate.stream()

        pygame.mixer.init()
        with open("voice_stream.mp3", "wb") as f:
            async for chunk in gen:
                if chunk["type"] == "audio":
                    f.write(chunk["data"])

        pygame.mixer.music.load("voice_stream.mp3")
        pygame.mixer.music.play()
        while pygame.mixer.music.get_busy():
            await asyncio.sleep(0.1)
        pygame.mixer.music.unload()
        os.remove("voice_stream.mp3")
    except Exception as e:
        print("TTS Error:", e)

def tts_process(q_in):
    while True:
        if not q_in.empty():
            msg = q_in.get()
            text = msg["text"]
            latency = time.time() - msg["timestamp"]
            print(f"[STT→TTS total] Delay: {latency}s")
            asyncio.run(speak_streamed_text(text))
        else:
            time.sleep(0.05)

# --------------------------- Main ---------------------------
if __name__ == "__main__":
    stt_to_logic = Queue()
    logic_to_tts = Queue()

    Process(target=stt_process, args=(stt_to_logic,)).start()
    Process(target=logic_process, args=(stt_to_logic, logic_to_tts)).start()
    Process(target=tts_process, args=(logic_to_tts,)).start()

    while True:
        time.sleep(1)