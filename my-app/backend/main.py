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

TEMP_FOLDER = "temp"

@app.post("/generate")
async def generate(request: GenerateRequest):
    try:
        # Download file from Supabase URL
        print(f"Downloading file from URL: {request.file_url}")  # Debug log
        
        # Add headers to mimic a browser request
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Connection': 'keep-alive',
            'Referer': 'https://pnxcyuwebcqrxkqbnzcd.supabase.co/'
        }
        
        try:
            response = requests.get(request.file_url, headers=headers, stream=True)
            if not response.ok:
                print(f"Download failed with status: {response.status_code}")  # Debug log
                print(f"Response headers: {response.headers}")  # Debug log
                print(f"Response content: {response.text}")  # Debug log
                raise HTTPException(
                    status_code=400,
                    detail=f"Failed to download file from Supabase. Status: {response.status_code}"
                )
        except requests.exceptions.RequestException as e:
            print(f"Request exception: {str(e)}")  # Debug log
            raise HTTPException(
                status_code=400,
                detail=f"Failed to download file: {str(e)}"
            )

        # Create temp folder if it doesn't exist
        if not os.path.exists(TEMP_FOLDER):
            os.makedirs(TEMP_FOLDER)
        else:
            # Clear temp folder
            for filename in os.listdir(TEMP_FOLDER):
                file_path = os.path.join(TEMP_FOLDER, filename)
                try:
                    os.remove(file_path)
                except Exception as e:
                    print(f"Error removing file {file_path}: {str(e)}")  # Debug log

        # Save the file
        file_path = os.path.join(TEMP_FOLDER, "document.pdf")
        total_size = 0
        try:
            with open(file_path, "wb") as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
                        total_size += len(chunk)
                        print(f"Downloaded {total_size} bytes so far...")
        except Exception as e:
            print(f"Error saving file: {str(e)}")  # Debug log
            raise HTTPException(
                status_code=500,
                detail=f"Failed to save file: {str(e)}"
            )

        print(f"File downloaded and saved to: {file_path}")  # Debug log
        print(f"Total file size: {total_size} bytes")  # Debug log
        
        # Verify file exists and has content
        if not os.path.exists(file_path):
            raise HTTPException(status_code=500, detail="File was not saved correctly")
            
        file_size = os.path.getsize(file_path)
        print(f"Actual file size on disk: {file_size} bytes")
        
        if file_size == 0:
            raise HTTPException(status_code=500, detail="Downloaded file is empty")

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
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
