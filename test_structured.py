"""Test structured output with Gemma 4."""
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env")

from google import genai
from google.genai import types

api_key = os.getenv("GEMINI_API_KEY", "").strip().strip('"').strip("'")
model_id = os.getenv("GEMMA_MODEL", "")

client = genai.Client(api_key=api_key, http_options={"timeout": 120000})

# Test 1: response_schema with a dict
print("=== Test 1: response_schema with dict ===")
schema_dict = {
    "type": "object",
    "properties": {
        "greeting": {"type": "string"},
        "number": {"type": "integer"}
    },
    "required": ["greeting", "number"]
}
try:
    config = types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=schema_dict,
    )
    response = client.models.generate_content(
        model=model_id,
        contents="Say hello and pick a random number",
        config=config,
    )
    print(f"  Response: {response.text}")
except Exception as e:
    print(f"  ERROR: {type(e).__name__}: {e}")

# Test 2: response_json_schema with a dict
print("\n=== Test 2: response_json_schema with dict ===")
try:
    config2 = types.GenerateContentConfig(
        response_mime_type="application/json",
        response_json_schema=schema_dict,
    )
    response2 = client.models.generate_content(
        model=model_id,
        contents="Say hello and pick a random number",
        config=config2,
    )
    print(f"  Response: {response2.text}")
except Exception as e:
    print(f"  ERROR: {type(e).__name__}: {e}")
