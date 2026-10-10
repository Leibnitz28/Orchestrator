"""Diagnostic script: list available models, check ElevenLabs, etc."""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env")

def list_models():
    from google import genai
    api_key = os.getenv("GEMINI_API_KEY", "").strip().strip('"').strip("'")
    if not api_key:
        print("ERROR: GEMINI_API_KEY not set")
        return
    print(f"API key length: {len(api_key)} chars")
    client = genai.Client(api_key=api_key, http_options={"timeout": 30000})
    
    print("\n=== Available Gemma models ===")
    try:
        all_models = []
        for m in client.models.list():
            if "gemini" in m.name.lower() or "gemma" in m.name.lower():
                all_models.append(m.name)
        print(f"  Found {len(all_models)} total Gemini/Gemma models.")
        for name in all_models[:15]:
            print(f"  {name}")
        if len(all_models) > 15:
            print("  ... (truncated)")
    except Exception as e:
        print(f"  ERROR listing models: {type(e).__name__}: {e}")
    
    configured_model = os.getenv("GEMMA_MODEL", "")
    print(f"\nConfigured GEMMA_MODEL: {configured_model}")
    if configured_model in [m for m in gemma_models]:
        print("  ✓ Model found in available list")
    else:
        print("  ✗ Model NOT found in available list")
        


def test_genai_simple():
    from google import genai
    api_key = os.getenv("GEMINI_API_KEY", "").strip().strip('"').strip("'")
    configured_model = os.getenv("GEMMA_MODEL", "")
    print(f"\n=== Simple generation test with {configured_model} ===")
    client = genai.Client(api_key=api_key, http_options={"timeout": 120000})
    try:
        response = client.models.generate_content(
            model=configured_model,
            contents="Say hello in JSON: {\"greeting\": \"...\"}",
        )
        print(f"Response: {response.text[:500]}")
    except Exception as e:
        print(f"ERROR: {type(e).__name__}: {e}")

if __name__ == "__main__":
    action = sys.argv[1] if len(sys.argv) > 1 else "all"
    if action in ("all", "models"):
        list_models()

    if action in ("all", "test"):
        test_genai_simple()
