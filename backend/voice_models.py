"""
Voice Models Module
Handles speech-to-text and text-to-speech
- Speech-to-text: Groq Whisper Large V3
- Text-to-speech: Microsoft Edge TTS with pygame
"""

import os
import asyncio
import edge_tts
import pygame
import uuid
from io import BytesIO
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Initialize Groq client for speech-to-text
client = OpenAI(
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

VOICE = "en-IN-PrabhatNeural"   # Indian male neural voice
# Alternatives:
# en-IN-NeerjaNeural  (Indian female)
# en-US-GuyNeural
# en-GB-RyanNeural

pygame.mixer.init()

async def speech_to_text(audio_file_path: str) -> str:
    """
    Convert speech to text using Whisper Large V3 via Groq
    
    Args:
        audio_file_path: Path to the audio file
        
    Returns:
        Transcribed text
    """
    try:
        with open(audio_file_path, "rb") as audio_file:
            transcription = client.audio.transcriptions.create(
                model="whisper-large-v3",
                file=audio_file,
                response_format="text"
            )
        return transcription
    except Exception as e:
        print(f"Speech-to-text error: {e}")
        return ""

async def speech_to_text_from_bytes(audio_bytes: bytes, filename: str = "audio.wav") -> str:
    """
    Convert speech to text from audio bytes using Whisper Large V3 via Groq
    
    Args:
        audio_bytes: Audio data as bytes
        filename: Filename for the audio (with extension)
        
    Returns:
        Transcribed text
    """
    try:
        # Create a file-like object from bytes
        audio_file = BytesIO(audio_bytes)
        audio_file.name = filename
        
        transcription = client.audio.transcriptions.create(
            model="whisper-large-v3",
            file=audio_file,
            response_format="text"
        )
        return transcription
    except Exception as e:
        print(f"Speech-to-text error: {e}")
        return ""

async def speak_async(text, filename):
    communicate = edge_tts.Communicate(text=text, voice=VOICE, rate="+20%")
    await communicate.save(filename)

def speak(text):
    if not text.strip():
        return
    filename = f"voice_{uuid.uuid4()}.mp3"
    asyncio.run(speak_async(text, filename))
    pygame.mixer.music.load(filename)
    pygame.mixer.music.play()
    while pygame.mixer.music.get_busy():
        continue
    pygame.mixer.music.unload()
    os.remove(filename)

async def text_to_speech(text: str) -> bytes:
    """
    Convert text to speech using Microsoft Edge TTS
    
    Args:
        text: Text to convert to speech
        
    Returns:
        Audio data as bytes (MP3 format)
    """
    if not text.strip():
        return b""
    
    try:
        # Create a communicate object with faster rate
        communicate = edge_tts.Communicate(text=text, voice=VOICE, rate="+20%")
        
        # Save to BytesIO instead of file
        audio_data = BytesIO()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_data.write(chunk["data"])
        
        # Return the audio bytes
        audio_data.seek(0)
        return audio_data.read()
        
    except Exception as e:
        print(f"Text-to-speech error: {e}")
        return b""

async def text_to_speech_stream(text: str):
    """
    Convert text to speech with streaming support using Edge TTS
    
    Args:
        text: Text to convert to speech
        
    Yields:
        Audio chunks
    """
    if not text.strip():
        return
    
    try:
        communicate = edge_tts.Communicate(text=text, voice=VOICE, rate="+20%")
        
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                yield chunk["data"]
            
    except Exception as e:
        print(f"Text-to-speech streaming error: {e}")
        yield b""
