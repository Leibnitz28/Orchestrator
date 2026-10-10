import requests
import sys

print("Testing direct HTTPS connection to generativelanguage.googleapis.com...")
try:
    response = requests.get("https://generativelanguage.googleapis.com", timeout=10)
    print(f"Status Code: {response.status_code}")
    print("Success: Connection established.")
except requests.exceptions.RequestException as e:
    print(f"Failed to connect: {type(e).__name__}: {e}")
    sys.exit(1)
