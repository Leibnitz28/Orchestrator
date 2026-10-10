import sys
import json
from .client import generate_campaign

def main():
    print("Starting campaign generation...", flush=True)
    if len(sys.argv) < 2:
        print("Usage: python -m orchestrator \"<campaign idea>\"", flush=True)
        sys.exit(1)
    
    idea = " ".join(sys.argv[1:])
    print(f"Idea received: {idea}", flush=True)
    
    try:
        package = generate_campaign(idea)
        print("Response received, validating...", flush=True)
        # Assuming package is a Pydantic model
        print(package.model_dump_json(indent=2), flush=True)
    except Exception as e:
        print(f"ERROR: {type(e).__name__}: {e}", file=sys.stderr, flush=True)
        sys.exit(1)

if __name__ == "__main__":
    main()
