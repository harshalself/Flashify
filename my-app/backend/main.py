import uvicorn
from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import Union
import os
import requests
from bot import Bot
from pydantic import BaseModel

class GenerateRequest(BaseModel):
    file_url: str
    num_flash_cards: int = 5
    optional_instructions: str = ""

origins = [
    "http://localhost:3000",
    "http://localhost:19000",  # Expo web
    "http://localhost:19006",  # Expo web
    "exp://localhost:19000",   # Expo Go
    "exp://localhost:19006",   # Expo Go
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

TEMP_FOLDER = "temp"

@app.post("/generate")
async def generate(request: GenerateRequest):
    try:
        # Download file from Supabase URL
        response = requests.get(request.file_url)
        if not response.ok:
            raise HTTPException(
                status_code=400,
                detail="Failed to download file from Supabase"
            )

        # Create temp folder if it doesn't exist
        if not os.path.exists(TEMP_FOLDER):
            os.makedirs(TEMP_FOLDER)
        else:
            # Clear temp folder
            for filename in os.listdir(TEMP_FOLDER):
                file_path = os.path.join(TEMP_FOLDER, filename)
                os.remove(file_path)

        # Save the file
        file_path = os.path.join(TEMP_FOLDER, "document.pdf")
        with open(file_path, "wb") as f:
            f.write(response.content)

        print(f"Processing file from Supabase")  # Debug log

        bot = Bot(TEMP_FOLDER)
        try:
            bot.load()
            print("Document loaded successfully")  # Debug log
        except Exception as e:
            print(f"Error in bot.load(): {str(e)}")  # Debug log
            raise HTTPException(
                status_code=500,
                detail=f"Failed to load document: {str(e)}"
            )

        try:
            flashcards = bot.generate(
                num_flash_cards=request.num_flash_cards,
                optional_instructions=request.optional_instructions
            )
            print(f"Generated {len(flashcards)} flashcards")  # Debug log
            return flashcards
        except Exception as e:
            print(f"Error in bot.generate(): {str(e)}")  # Debug log
            raise HTTPException(
                status_code=500,
                detail=f"Failed to generate flashcards: {str(e)}"
            )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in generate: {str(e)}")  # Debug log
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}"
        )

if __name__ == "__main__":
    uvicorn.run("main:app", reload=True)
