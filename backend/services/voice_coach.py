"""
Voice Coach Service: ElevenLabs Ultra-Low Latency Conversational Voice Engine.
Powered by ElevenLabs Multilingual V2 and Conversational Agent API.
"""

import base64
import os
from typing import Optional

import httpx
from dotenv import load_dotenv

load_dotenv()

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "EXAVITQu4vr4xnSDxMaL")
ELEVENLABS_MODEL_ID = os.getenv("ELEVENLABS_MODEL_ID", "eleven_multilingual_v2")
ELEVENLABS_AGENT_ID = os.getenv("ELEVENLABS_AGENT_ID", "agent_4501m54njtdkem0aacw0b69ayre4")


async def synthesize_speech_elevenlabs(text: str, voice_id: Optional[str] = None) -> Optional[str]:
    """
    Synthesizes natural conversational voice using ElevenLabs API.
    Returns base64 encoded audio/mp3 string.
    """
    if not ELEVENLABS_API_KEY:
        return None

    vid = voice_id or ELEVENLABS_VOICE_ID or "EXAVITQu4vr4xnSDxMaL"
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
    }
    payload = {
        "text": text,
        "model_id": ELEVENLABS_MODEL_ID,
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75,
            "style": 0.35,
            "use_speaker_boost": True,
        },
    }

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"https://api.elevenlabs.io/v1/text-to-speech/{vid}",
                headers=headers,
                json=payload,
                timeout=20.0,
            )
            if resp.status_code == 200 and len(resp.content) > 0:
                return base64.b64encode(resp.content).decode("utf-8")
            else:
                print(f"[ElevenLabs TTS Error] Status {resp.status_code}: {resp.text}")
    except Exception as e:
        print(f"[ElevenLabs TTS Exception] {e}")

    return None


# Backward-compatible alias for existing service calls
async def synthesize_speech_sarvam(text: str, language_code: str = "hi-IN") -> Optional[str]:
    """Redirected to ElevenLabs API as requested by user."""
    return await synthesize_speech_elevenlabs(text)
