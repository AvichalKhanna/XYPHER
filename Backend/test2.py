import requests

API_KEY = "35e839a65b200a76bd910c24911140bae7f594509e84a4f471c15675b3b42858"
VOICE_ID = "21m00Tcm4TlvDq8ikWAM"  # example voice
TEXT = "Hello! This is a test of an ultra-realistic voice with breathing and emotion."

url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"

headers = {
    "xi-api-key": API_KEY,
    "Content-Type": "application/json"
}

data = {
    "text": TEXT,
    "voice_settings": {
        "stability": 0.75,  # controls consistency of the voice
        "similarity_boost": 0.85  # higher = closer to the voice profile
    }
}

response = requests.post(url, json=data, headers=headers)

# Save the generated audio
with open("output.wav", "wb") as f:
    f.write(response.content)

print("Audio generated successfully!")
