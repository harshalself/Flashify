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

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GenerateRequest(BaseModel):
    file_url: str
    num_flash_cards: Optional[int] = 5
    optional_instructions: Optional[str] = ""

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

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
