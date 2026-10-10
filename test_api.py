import json
import httpx

BASE_URL = "http://127.0.0.1:8000"

def test_api():
    print(f"Connecting to {BASE_URL} with httpx...")
    with httpx.Client(base_url=BASE_URL, timeout=180.0) as client:
        # 1. Test /api/health
        print("\n" + "="*50)
        print("GET /api/health")
        print("="*50)
        r_health = client.get("/api/health")
        print(f"Status Code: {r_health.status_code}")
        print("Headers Content-Type:", r_health.headers.get("content-type"))
        print("Body:")
        print(json.dumps(r_health.json(), indent=2))

        # 2. Test /api/generate-campaign
        print("\n" + "="*50)
        print("POST /api/generate-campaign")
        print("="*50)
        payload = {"idea": "A bakery introducing festive gift boxes"}
        r_campaign = client.post("/api/generate-campaign", json=payload)
        print(f"Status Code: {r_campaign.status_code}")
        print("Headers Content-Type:", r_campaign.headers.get("content-type"))
        print("Body:")
        print(json.dumps(r_campaign.json(), indent=2))

if __name__ == "__main__":
    test_api()
