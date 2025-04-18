import uvicorn
from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import Union, Optional
import os
import requests
from bot import Bot
from pydantic import BaseModel
import tempfile
import logging
from supabase import create_client, Client
import json
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Supabase client
supabase: Client = create_client(
    os.getenv("SUPABASE_URL", "https://pnxcyuwebcqrxkqbnzcd.supabase.co"),
    os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBueGN5dXdlYmNxcnhrcWJuemNkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwOTY5NjQ0MCwiZXhwIjoyMDI1Mjc2NDQwfQ.0Xj4m8QZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ")
)

class GenerateRequest(BaseModel):
    file_url: str
    num_flash_cards: Optional[int] = 5
    optional_instructions: Optional[str] = ""

class SaveFlashcardsRequest(BaseModel):
    flashcards: list
    user_id: str

origins = [
    "http://localhost:3000",
    "http://localhost:19000",  # Expo web
    "http://localhost:19006",  # Expo web
    "exp://localhost:19000",   # Expo Go
    "exp://localhost:19006",   # Expo Go
    "http://192.168.0.133:19000",  # Local network for Expo Go
    "http://192.168.0.133:19006",  # Local network for Expo Go
    "exp://192.168.0.133:19000",   # Local network for Expo Go
    "exp://192.168.0.133:19006",   # Local network for Expo Go
    "http://192.168.1.*:19000",  # Local network for Expo Go
    "http://192.168.1.*:19006",  # Local network for Expo Go
    "exp://192.168.1.*:19000",   # Local network for Expo Go
    "exp://192.168.1.*:19006",   # Local network for Expo Go
    "*"
]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create a temporary directory for file processing
TEMP_FOLDER = tempfile.mkdtemp()
logger.info(f"Created temporary folder: {TEMP_FOLDER}")

@app.post("/generate")
async def generate_flashcards(request: GenerateRequest):
    try:
        logger.info("Starting flashcard generation process")
        
        # Download file from Supabase
        logger.info(f"Downloading file from: {request.file_url}")
        response = requests.get(request.file_url)
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to download file from Supabase")
        
        # Save file to temp folder
        file_path = os.path.join(TEMP_FOLDER, "document.pdf")
        with open(file_path, "wb") as f:
            f.write(response.content)
        logger.info(f"File saved to: {file_path}")
        
        # Initialize bot and process file
        bot = Bot(TEMP_FOLDER)
        bot.load()
        
        # Generate flashcards
        flashcards = bot.generate(
            num_flash_cards=request.num_flash_cards,
            optional_instructions=request.optional_instructions
        )
        
        # Clean up temp file
        try:
            os.remove(file_path)
            logger.info("Temporary file cleaned up")
        except Exception as e:
            logger.warning(f"Failed to clean up temporary file: {str(e)}")
        
        return {"flashcards": flashcards}
        
    except Exception as e:
        logger.error(f"Error in generate_flashcards: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/save-flashcards")
async def save_flashcards(request: SaveFlashcardsRequest):
    try:
        logger.info("Starting flashcard save process")
        logger.info(f"Received flashcards: {request.flashcards}")
        logger.info(f"User ID: {request.user_id}")

        # Create a new flashcard set
        current_time = datetime.now()
        set_title = f"New Set {current_time.strftime('%Y-%m-%d %H:%M:%S')}"

        set_data = {
            "title": set_title,
            "description": "Generated from document",
            "user_id": request.user_id,
            "created_at": current_time.isoformat(),
            "last_modified": current_time.isoformat()
        }

        logger.info(f"Creating flashcard set: {set_data}")

        # Insert flashcard set
        set_result = supabase.table("flashcard_sets").insert([set_data]).execute()

        # Access .data safely from APIResponse
        set_data_result = set_result.data

        if not set_data_result or not isinstance(set_data_result, list) or not set_data_result[0].get("id"):
            logger.error(f"Failed to create flashcard set: {set_result}")
            raise HTTPException(status_code=500, detail="Failed to create flashcard set")

        set_id = set_data_result[0]["id"]
        logger.info(f"Flashcard set created with ID: {set_id}")

        # Prepare flashcards data
        flashcards_data = []
        for index, card in enumerate(request.flashcards):
            flashcard = {
                "set_id": set_id,
                "question": card["question"],
                "answer": card["answer"],
                "order_index": index,
                "created_at": current_time.isoformat()
            }
            flashcards_data.append(flashcard)

        logger.info(f"Prepared {len(flashcards_data)} flashcards for insertion")

        # Insert flashcards
        cards_result = supabase.table("flashcards").insert(flashcards_data).execute()

        # Access .data safely from APIResponse
        cards_data_result = cards_result.data

        if not cards_data_result or not isinstance(cards_data_result, list):
            logger.error(f"Error inserting flashcards: {cards_result}")
            raise HTTPException(status_code=500, detail="Failed to insert flashcards")

        logger.info("Flashcards inserted successfully")

        # Verify the data
        verify_set = supabase.table("flashcard_sets").select("*").eq("id", set_id).execute()
        verify_cards = supabase.table("flashcards").select("*").eq("set_id", set_id).execute()

        logger.info(f"Verified set: {verify_set.data}")
        logger.info(f"Verified cards count: {len(verify_cards.data)}")

        return {
            "success": True,
            "set_id": set_id,
            "cards_count": len(verify_cards.data)
        }

    except Exception as e:
        logger.error(f"Error in save_flashcards: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
