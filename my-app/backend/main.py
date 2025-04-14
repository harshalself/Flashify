import uvicorn
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Union
import os
from bot import Bot


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


@app.post("/upload")
async def upload(files: list[UploadFile] = File(...)):
    try:
        # create temp folder if it does not exist
        if not os.path.exists(TEMP_FOLDER):
            os.makedirs(TEMP_FOLDER)
        else:
            # remove all files in temp folder
            for filename in os.listdir(TEMP_FOLDER):
                file_path = os.path.join(TEMP_FOLDER, filename)
                os.remove(file_path)

        # process all the files
        saved_files = []
        for file in files:
            file_path = os.path.join(TEMP_FOLDER, file.filename)
            with open(file_path, "wb") as f:
                f.write(file.file.read())
            saved_files.append(file.filename)

        return {"uploaded": saved_files}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/generate")
async def generate(num_flash_cards: int = 5, optional_instructions: str = ""):
    try:
        # Check if temp folder exists and has files
        if not os.path.exists(TEMP_FOLDER):
            raise HTTPException(
                status_code=400,
                detail="No documents found. Please upload a document first."
            )
            
        files = os.listdir(TEMP_FOLDER)
        if not files:
            raise HTTPException(
                status_code=400,
                detail="No documents found. Please upload a document first."
            )

        print(f"Processing files: {files}")  # Debug log

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
                num_flash_cards=num_flash_cards,
                optional_instructions=optional_instructions
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
