import os
import requests
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# Mount the static directory to serve CSS, JS, etc.
app.mount("/static", StaticFiles(directory="static"), name="static")

class TextPayload(BaseModel):
    text: str

@app.get("/")
def read_index():
    # Serve the main HTML file from the 'templates' directory
    return FileResponse("templates/index.html")

@app.post("/generate-voice")
def generate_voice(payload: TextPayload):
    # Get the API key from your .env file
    murf_api_key = os.getenv("MURF_API_KEY")
    if not murf_api_key:
        raise HTTPException(status_code=500, detail="MURF_API_KEY not configured in .env file.")

    murf_url = "https://api.murf.ai/v1/speech/generate"

    # Using the header and body structure from the working example
    headers = {
        "Content-Type": "application/json",
        "api-key": murf_api_key  # Using 'api-key' as per the example
    }

    body = {
        "text": payload.text,
        "voiceId": "en-US-terrell"
    }

    try:
        # Using the synchronous 'requests' library
        response = requests.post(murf_url, headers=headers, json=body)
        response.raise_for_status() # Raises an exception for 4xx/5xx errors
        
        data = response.json()
        
        # Using 'audioFile' as the key from the example
        audio_url = data.get("audioFile") 
        return {"audio_url": audio_url}

    except requests.exceptions.RequestException as e:
        # This will catch errors from the Murf API and other request issues
        raise HTTPException(status_code=500, detail=f"API request failed: {e}")

# This block allows you to run the app directly with 'python main.py'
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)