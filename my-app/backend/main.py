import uvicorn
from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import Union, Optional
import os
import requests
from bot import Bot
from pydantic import BaseModel, AnyUrl, ValidationError
import tempfile
import logging
from supabase import create_client, Client
import json
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
ENV = os.getenv("ENV", "development").lower()

if ENV == "production":
    logging.basicConfig(level=logging.WARNING)
else:
    logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get environment variables with fallbacks
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    logger.error("SUPABASE_URL and/or SUPABASE_KEY environment variables are missing.")
    raise RuntimeError("SUPABASE_URL and SUPABASE_KEY must be set as environment variables.")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

class GenerateRequest(BaseModel):
    file_url: AnyUrl
    num_flash_cards: Optional[int] = 5
    optional_instructions: Optional[str] = ""

class FlashcardItem(BaseModel):
    question: str
    answer: str

class SaveFlashcardsRequest(BaseModel):
    flashcards: list[FlashcardItem]
    user_id: str

# For development and cross-platform compatibility, allow all relevant local and Expo URLs, plus the backend URL
origins = [
    "http://localhost:3000",
    "http://localhost:19000",
    "http://localhost:19006",
    "exp://localhost:19000",
    "exp://localhost:19006",
    BACKEND_URL,
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
        try:
            response = requests.get(str(request.file_url))
        except Exception as e:
            logger.error(f"Network error downloading file: {str(e)}")
            raise HTTPException(status_code=502, detail="Failed to download file. Please try again later.")
        if response.status_code != 200:
            logger.error(f"Failed to download file, status code: {response.status_code}")
            raise HTTPException(status_code=400, detail="Failed to download file from storage.")
        # Save file to temp folder
        file_path = os.path.join(TEMP_FOLDER, "document.pdf")
        with open(file_path, "wb") as f:
            f.write(response.content)
        logger.info(f"File saved to: {file_path}")
        # Initialize bot and process file
        bot = Bot(TEMP_FOLDER)
        try:
            bot.load()
        except Exception as e:
            logger.error(f"Gemini/Bot error: {str(e)}")
            raise HTTPException(status_code=502, detail="Failed to process document. Please try again later.")
        # Generate flashcards
        try:
            flashcards = bot.generate(
                num_flash_cards=request.num_flash_cards,
                optional_instructions=request.optional_instructions
            )
        except Exception as e:
            logger.error(f"Gemini/Bot error: {str(e)}")
            raise HTTPException(status_code=502, detail="Failed to generate flashcards. Please try again later.")
        # Clean up temp file
        try:
            os.remove(file_path)
            logger.info("Temporary file cleaned up")
        except Exception as e:
            logger.warning(f"Failed to clean up temporary file: {str(e)}")
        return {"flashcards": flashcards}
    except ValidationError as ve:
        logger.error(f"Validation error: {ve}")
        raise HTTPException(status_code=422, detail=str(ve))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in generate_flashcards: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error.")

@app.post("/save-flashcards")
async def save_flashcards(request: SaveFlashcardsRequest):
    try:
        logger.info("Starting flashcard save process")
        logger.info(f"Received {len(request.flashcards)} flashcards")
        masked_user_id = request.user_id[:2] + "***" + request.user_id[-2:] if len(request.user_id) > 4 else "***"
        logger.info(f"User ID: {masked_user_id}")
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
        logger.info(f"Creating flashcard set: {{'title': set_title, 'user_id': masked_user_id}}")
        # Insert flashcard set
        try:
            set_result = supabase.table("flashcard_sets").insert([set_data]).execute()
        except Exception as e:
            logger.error(f"Supabase error (set insert): {str(e)}")
            raise HTTPException(status_code=502, detail="Failed to save flashcard set. Please try again later.")
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
                "question": card.question,
                "answer": card.answer,
                "order_index": index,
                "created_at": current_time.isoformat()
            }
            flashcards_data.append(flashcard)
        logger.info(f"Prepared {len(flashcards_data)} flashcards for insertion")
        # Insert flashcards
        try:
            cards_result = supabase.table("flashcards").insert(flashcards_data).execute()
        except Exception as e:
            logger.error(f"Supabase error (flashcards insert): {str(e)}")
            raise HTTPException(status_code=502, detail="Failed to save flashcards. Please try again later.")
        cards_data_result = cards_result.data
        if not cards_data_result or not isinstance(cards_data_result, list):
            logger.error(f"Error inserting flashcards: {cards_result}")
            raise HTTPException(status_code=500, detail="Failed to insert flashcards")
        logger.info("Flashcards inserted successfully")
        # Verify the data
        try:
            verify_set = supabase.table("flashcard_sets").select("*").eq("id", set_id).execute()
            verify_cards = supabase.table("flashcards").select("*").eq("set_id", set_id).execute()
        except Exception as e:
            logger.error(f"Supabase error (verification): {str(e)}")
            raise HTTPException(status_code=502, detail="Failed to verify saved data. Please try again later.")
        logger.info(f"Verified set: {verify_set.data}")
        logger.info(f"Verified cards count: {len(verify_cards.data)}")
        return {
            "success": True,
            "set_id": set_id,
            "cards_count": len(verify_cards.data)
        }
    except ValidationError as ve:
        logger.error(f"Validation error: {ve}")
        raise HTTPException(status_code=422, detail=str(ve))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in save_flashcards: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error.")

if __name__ == "__main__":
    # Get port from environment variable or default to 8000
    port = int(os.getenv("PORT", "8000"))
    # Get host from environment variable or default to 0.0.0.0
    host = os.getenv("HOST", "0.0.0.0")
    
    uvicorn.run("main:app", host=host, port=port, reload=True)
