"""
Voice Coach Service: Integrates Sarvam AI (https://indus.sarvam.ai) and ElevenLabs.
Member 1 Domain.
"""
import os
import httpx
from typing import Optional, Dict, Any
from dotenv import load_dotenv

load_dotenv()

SARVAM_API_KEY = os.getenv("SARVAM_API_KEY", "")
SARVAM_API_URL = os.getenv("SARVAM_API_URL", "https://api.sarvam.ai")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

async def transcribe_audio_sarvam(audio_bytes: bytes, language_code: str = "hi-IN") -> str:
    """
    Transcribes spoken voice using Sarvam AI Saaras model.
    Docs: https://indus.sarvam.ai
    """
    if not SARVAM_API_KEY:
        return "Haan, theek hai, aaj ka ₹50 save kar do."

    headers = {"api-subscription-key": SARVAM_API_KEY}
    files = {"file": ("audio.wav", audio_bytes, "audio/wav")}
    data = {"model": "saaras:v1", "language_code": language_code}

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(f"{SARVAM_API_URL}/speech-to-text", headers=headers, files=files, data=data, timeout=10.0)
            if resp.status_code == 200:
                return resp.json().get("transcript", "")
    except Exception as e:
        print(f"Sarvam STT error: {e}")
    
    return "Haan, theek hai, aaj ka ₹50 save kar do."

async def synthesize_speech_sarvam(text: str, language_code: str = "hi-IN") -> Optional[str]:
    """
    Synthesizes conversational spoken voice using Sarvam Bulbul model.
    Returns base64 audio string or URL.
    """
    if not SARVAM_API_KEY:
        return None

    headers = {
        "api-subscription-key": SARVAM_API_KEY,
        "Content-Type": "application/json"
    }
    payload = {
        "inputs": [text],
        "target_language_code": language_code,
        "speaker": "meera",
        "pitch": 0,
        "pace": 1.05,
        "loudness": 1.5,
        "speech_sample_rate": 22050,
        "enable_preprocessing": True,
        "model": "bulbul:v1"
    }

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(f"{SARVAM_API_URL}/text-to-speech", headers=headers, json=payload, timeout=10.0)
            if resp.status_code == 200:
                audios = resp.json().get("audios", [])
                if audios:
                    return audios[0]
    except Exception as e:
        print(f"Sarvam TTS error: {e}")

    return None
