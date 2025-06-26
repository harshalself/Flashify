import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from dotenv import load_dotenv
import PyPDF2
import logging
import google.generativeai as genai

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# Configure the Gemini API
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    logger.error("GOOGLE_API_KEY environment variable is missing.")
    raise RuntimeError("GOOGLE_API_KEY must be set as an environment variable.")

genai.configure(api_key=GOOGLE_API_KEY)

class Bot:
    def __init__(self, temp_folder: str):
        self.temp_folder = temp_folder
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-pro",
            google_api_key=GOOGLE_API_KEY,
            temperature=0.7,
            convert_system_message_to_human=True
        )
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
        )

    def extract_text_from_pdf(self, file_path: str) -> str:
        try:
            logger.info(f"Extracting text from PDF: {file_path}")
            text = ""
            with open(file_path, "rb") as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        # Clean null characters
                        text += page_text.replace("\x00", "") + "\n"
            logger.info(f"Successfully extracted text from PDF")
            logger.info(f"Extracted Text Preview: {text[:500]}")
            return text
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {str(e)}")
            raise Exception(f"Failed to extract text from PDF: {str(e)}")

    def load(self):
        try:
            logger.info("Starting document loading process")
            file_path = os.path.join(self.temp_folder, "document.pdf")
            
            if not os.path.exists(file_path):
                raise Exception("Document file not found")

            # Extract text from PDF
            text = self.extract_text_from_pdf(file_path)
            if not text.strip():
                raise Exception("No text content found in PDF")

            # Split text into chunks
            logger.info("Splitting text into chunks")
            self.text_chunks = self.text_splitter.split_text(text)
            logger.info(f"Split into {len(self.text_chunks)} chunks")

        except Exception as e:
            logger.error(f"Error in load(): {str(e)}")
            raise Exception(f"Failed to load document: {str(e)}")

    def generate(
        self, num_flash_cards: int = 5, optional_instructions: str = ""
    ) -> list:
        try:
            logger.info("Starting flashcard generation")
            if not hasattr(self, 'text_chunks'):
                raise Exception("Document not loaded. Call load() first.")

            if not self.text_chunks:
                raise Exception("No text chunks available for flashcard generation")

            # Use the first chunk for flashcard generation
            content = self.text_chunks[0]
            logger.info(f"Content length: {len(content)} characters")

            # Create prompt
            prompt = PromptTemplate(
                input_variables=["content", "num_flash_cards", "optional_instructions"],
                template="""
                Generate {num_flash_cards} flashcards from the following content.
                Each flashcard should have a clear question and answer.
                {optional_instructions}

                Content:
                {content}

                Format the response as a JSON array of objects with 'question' and 'answer' fields.
                Example format:
                [
                    {{"question": "What is the capital of France?", "answer": "Paris"}},
                    {{"question": "When did World War II end?", "answer": "1945"}}
                ]

                Return ONLY the JSON array, nothing else.
                """,
            )

            # Create chain
            chain = LLMChain(llm=self.llm, prompt=prompt)

            # Generate flashcards
            logger.info("Generating flashcards with LLM")
            result = chain.run(
                content=content,
                num_flash_cards=num_flash_cards,
                optional_instructions=optional_instructions,
            )

            # Clean up the response
            result = result.strip()
            if result.startswith("```json"):
                result = result[7:]
            if result.endswith("```"):
                result = result[:-3]
            result = result.strip()

            # Parse result
            import json
            try:
                flashcards = json.loads(result)
                if not isinstance(flashcards, list):
                    raise ValueError("Response is not a list")
                if len(flashcards) != num_flash_cards:
                    raise ValueError(f"Expected {num_flash_cards} flashcards, got {len(flashcards)}")
                logger.info(f"Successfully generated {len(flashcards)} flashcards")
                return flashcards
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse LLM response as JSON: {str(e)}")
                logger.error(f"Raw response: {result}")
                raise Exception("Failed to parse flashcard generation response")
            except ValueError as e:
                logger.error(f"Invalid flashcard format: {str(e)}")
                raise Exception(f"Invalid flashcard format: {str(e)}")

        except Exception as e:
            logger.error(f"Error in generate(): {str(e)}")
            raise Exception(f"Failed to generate flashcards: {str(e)}")
