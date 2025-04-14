from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain.text_splitter import CharacterTextSplitter
from langchain.document_loaders import (
    DirectoryLoader,
    PyPDFLoader,
    TextLoader,
    Docx2txtLoader,
)
from langchain.chains import RetrievalQA
from langchain.vectorstores import SupabaseVectorStore
from supabase import create_client, Client
from dotenv import load_dotenv
import json
import os
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

class Bot:
    def __init__(self, temp: str):
        self.path = temp
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-pro",
            google_api_key="AIzaSyAEeFZGZ5wi0hMQso-_s3tCcyZRopHdTnA",
            temperature=0
        )
        self.qa_chain = None
        
        # Initialize Supabase client
        try:
            supabase_url = os.getenv("SUPABASE_URL")
            supabase_key = os.getenv("SUPABASE_KEY")
            
            if not supabase_url or not supabase_key:
                raise ValueError("Supabase credentials not found in environment variables")
            
            logger.info("Initializing Supabase client...")
            self.supabase: Client = create_client(supabase_url, supabase_key)
            
            # Test the connection
            self.supabase.table('documents').select('id').limit(1).execute()
            logger.info("Successfully connected to Supabase")
            
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {str(e)}")
            raise

    def load(self):
        try:
            # Get all files in the temp directory
            files = os.listdir(self.path)
            if not files:
                raise Exception("No files found in the temp directory")

            logger.info(f"Found files: {files}")

            documents = []
            for file in files:
                file_path = os.path.join(self.path, file)
                logger.info(f"Processing file: {file}")
                
                try:
                    if file.endswith('.pdf'):
                        logger.info("Loading PDF file...")
                        loader = PyPDFLoader(file_path)
                    elif file.endswith('.txt'):
                        logger.info("Loading text file...")
                        loader = TextLoader(file_path)
                    elif file.endswith('.docx'):
                        logger.info("Loading DOCX file...")
                        loader = Docx2txtLoader(file_path)
                    else:
                        logger.warning(f"Unsupported file type: {file}")
                        continue
                    
                    docs = loader.load()
                    logger.info(f"Loaded {len(docs)} pages/chunks from {file}")
                    documents.extend(docs)
                except Exception as e:
                    logger.error(f"Error loading file {file}: {str(e)}")
                    continue

            if not documents:
                raise Exception("No valid documents could be loaded")

            logger.info(f"Total documents loaded: {len(documents)}")

            text_splitter = CharacterTextSplitter(
                chunk_size=1500,
                chunk_overlap=200,
                separator="\n"
            )
            texts = text_splitter.split_documents(documents)
            logger.info(f"Split into {len(texts)} chunks")

            logger.info("Creating embeddings...")
            embeddings = GoogleGenerativeAIEmbeddings(
                model="models/embedding-001",
                google_api_key="AIzaSyAEeFZGZ5wi0hMQso-_s3tCcyZRopHdTnA"
            )
            
            # Create Supabase vector store
            try:
                logger.info("Creating Supabase vector store...")
                vectorstore = SupabaseVectorStore.from_documents(
                    texts,
                    embeddings,
                    client=self.supabase,
                    table_name="documents",
                    query_name="match_documents"
                )
                logger.info("Successfully created vector store")
                
            except Exception as e:
                logger.error(f"Failed to create vector store: {str(e)}")
                raise
            
            retriever = vectorstore.as_retriever()
            
            logger.info("Setting up QA chain...")
            self.qa_chain = RetrievalQA.from_chain_type(
                self.llm,
                retriever=retriever,
                return_source_documents=True
            )
            logger.info("Document processing complete")

        except Exception as e:
            logger.error(f"Error in load(): {str(e)}")
            raise

    def generate(
        self,
        num_flash_cards: int = 5,
        max_attempts: int = 10,
        optional_instructions: str = "",
    ):
        if not self.qa_chain:
            raise Exception("Document not loaded. Call load() first.")

        query = f"""Based on the document content, create exactly {num_flash_cards} high-quality question-answer pairs.
        Each question should be clear, specific, and test understanding of key concepts.
        Each answer should be concise but complete.
        
        Format the response as a JSON array of objects with 'question' and 'answer' fields.
        Example format:
        [
            {{"question": "What is the capital of France?", "answer": "Paris"}},
            {{"question": "When did World War II end?", "answer": "1945"}}
        ]
        
        {f"Additional instructions: {optional_instructions}" if optional_instructions else ""}
        
        Return ONLY the JSON array, nothing else."""

        for attempt in range(1, max_attempts + 1):
            try:
                logger.info(f"Attempt {attempt}/{max_attempts} to generate flashcards")
                res = self.qa_chain({"query": query})
                result = res["result"].strip()
                
                # Clean up the response to ensure it's valid JSON
                if result.startswith("```json"):
                    result = result[7:]
                if result.endswith("```"):
                    result = result[:-3]
                result = result.strip()
                
                json_res = json.loads(result)
                if not isinstance(json_res, list):
                    raise ValueError("Response is not a list")
                if len(json_res) != num_flash_cards:
                    raise ValueError(f"Expected {num_flash_cards} flashcards, got {len(json_res)}")
                
                logger.info("Successfully generated flashcards")
                return json_res
            except (json.JSONDecodeError, ValueError) as e:
                logger.warning(f"Attempt {attempt}/{max_attempts} failed: {str(e)}")
                if attempt == max_attempts:
                    raise Exception(f"Failed to generate valid flashcards after {max_attempts} attempts: {str(e)}")
            except Exception as e:
                logger.error(f"Unexpected error on attempt {attempt}: {str(e)}")
                raise
