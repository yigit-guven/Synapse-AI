import os
import shutil
import tempfile
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
from typing import List

from src.core.ingest import load_and_split_pdf, load_and_split_web_page
from src.core.vector_store import VectorStore
from src.core.llm import create_rag_chain
from src.core.config import settings

import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Synapse AI API")

# Initialize Vector Store (Global Singleton)
vector_store = VectorStore()

# Request Models
class ChatRequest(BaseModel):
    message: str
    model_name: str = "llama3"

class ResetRequest(BaseModel):
    pass

# --- API Endpoints ---

@app.get("/")
async def serve_index():
    logger.info("Serving index.html")
    if not os.path.exists("index.html"):
        logger.error("index.html NOT FOUND in %s", os.getcwd())
        raise HTTPException(status_code=404, detail="Index file not found")
    return FileResponse("index.html")

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    logger.info("Chat request: %s", request.message)
    try:
        qa_chain = create_rag_chain(vector_store, model_name=request.model_name)
        
        async def event_generator():
            async for chunk in qa_chain.astream({"input": request.message}):
                if "answer" in chunk:
                    yield chunk["answer"]
        
        return StreamingResponse(
            event_generator(), 
            media_type="text/plain",
            headers={
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Content-Type-Options": "nosniff"
            }
        )
    except Exception as e:
        logger.error("Chat error: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ingest")
async def ingest_endpoint(files: List[UploadFile] = File(...)):
    logger.info("Ingest request for %d files", len(files))
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    
    ingested_count = 0
    errors = []

    for file in files:
        try:
            logger.info("Processing file: %s", file.filename)
            # Save to temp file
            suffix = os.path.splitext(file.filename)[1]
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                shutil.copyfileobj(file.file, tmp)
                tmp_path = tmp.name
            
            # Process
            if suffix.lower() == ".pdf":
                chunks = load_and_split_pdf(tmp_path)
                vector_store.add_documents(chunks)
                ingested_count += len(chunks)
                logger.info("Successfully ingested %d chunks from %s", len(chunks), file.filename)
            else:
                errors.append(f"Unsupported file type: {file.filename}")
                logger.warning("Unsupported file type: %s", file.filename)

            # Cleanup
            os.remove(tmp_path)
            
        except Exception as e:
            logger.error("Error processing %s: %s", file.filename, str(e))
            errors.append(f"Error processing {file.filename}: {str(e)}")
            
    return {
        "message": f"Ingested {ingested_count} chunks.",
        "errors": errors
    }

@app.post("/api/reset")
async def reset_endpoint():
    logger.info("Reset request received")
    try:
        vector_store.clear()
        return {"message": "Database cleared successfully."}
    except Exception as e:
        logger.error("Reset error: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e))

# Mount Static Files (CSS, JS) AFTER routes to avoid shadowing
# Specify the directory explicitly and check if it exists
if os.path.exists("."):
    app.mount("/static", StaticFiles(directory="."), name="static")

# Explicit routes for style and js if needed, though /static covers them
@app.get("/style.css")
async def serve_css():
    return FileResponse("style.css")

@app.get("/index.js")
async def serve_js():
    return FileResponse("index.js")

@app.get("/privacy.html")
async def serve_privacy():
    return FileResponse("privacy.html")

@app.get("/logo.svg")
async def serve_logo():
    return FileResponse("logo.svg")

@app.get("/socialbanner.png")
async def serve_banner():
    return FileResponse("socialbanner.png")
