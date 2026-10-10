import os
import json
from pathlib import Path
from dotenv import load_dotenv

# Ensure .env is loaded from the project root regardless of cwd
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(env_path)

MOCK_MODE = os.getenv("MOCK_MODE", "false").lower() == "true"

from google import genai
from google.genai import types
from pydantic import ValidationError

from .schema import CampaignPackage, campaign_package_schema
from .prompt import build_system_prompt, build_user_prompt

class OrchestratorError(Exception):
    pass

def generate_campaign(idea: str) -> CampaignPackage:
    """
    Generate a complete marketing campaign package from a raw idea using Gemini.
    
    Args:
        idea (str): The raw, unstructured campaign concept (5-500 chars).
        
    Returns:
        CampaignPackage: A validated Pydantic model containing the campaign assets.
        
    Raises:
        OrchestratorError: If the API call fails or validation fails after retries.
    """
    if MOCK_MODE:
        mock_data = {
            "campaign_title": "Festive Delights: Bakery Gift Boxes",
            "tagline": "Share the joy with our exclusive festive treats.",
            "target_audience": "Families, corporate gifting, and festive shoppers.",
            "color_palette": [
                {"name": "Festive Red", "hex": "#D32F2F"},
                {"name": "Gold Accent", "hex": "#FFD700"},
                {"name": "Cream White", "hex": "#F5F5DC"},
                {"name": "Deep Green", "hex": "#2E8B57"}
            ],
            "image_prompts": [
                {
                    "asset_type": "Poster",
                    "prompt": "A beautiful spread of festive bakery gift boxes with golden ribbons on a wooden table, warm lighting, cozy atmosphere.",
                    "aspect_ratio": "4:5"
                },
                {
                    "asset_type": "Instagram Square",
                    "prompt": "Top-down view of an open bakery box filled with decorated cookies and pastries, festive background, bright and cheerful.",
                    "aspect_ratio": "1:1"
                },
                {
                    "asset_type": "Banner",
                    "prompt": "Elegant bakery storefront decorated for the festivities with gift boxes displayed in the window, soft evening lighting.",
                    "aspect_ratio": "16:9"
                }
            ],
            "social_copy": [
                {
                    "platform": "Instagram",
                    "caption": "Get ready for the festivities with our new curated gift boxes! 🎁 Perfect for sharing joy with your loved ones.",
                    "hashtags": ["#FestiveBaking", "#GiftBoxes", "#BakeryLove"]
                },
                {
                    "platform": "LinkedIn",
                    "caption": "Looking for the perfect corporate gift this season? Our artisanal bakery gift boxes are sure to impress your clients and team.",
                    "hashtags": ["#CorporateGifting", "#FestiveSeason", "#BusinessGifts"]
                },
                {
                    "platform": "Twitter",
                    "caption": "Festive gift boxes are finally here! Treat yourself or a friend to our limited-time seasonal bakes. ✨",
                    "hashtags": ["#FestiveTreats", "#Bakery", "#GiftIdeas"]
                }
            ]
        }
        return CampaignPackage.model_validate(mock_data)

    model_id = os.environ.get("GEMMA_MODEL")
    if not model_id:
        raise OrchestratorError("GEMMA_MODEL environment variable is not set")
    
    api_key = os.getenv("GEMINI_API_KEY", "").strip().strip('"').strip("'")
    if not api_key:
        raise OrchestratorError("GEMINI_API_KEY environment variable is not set")
        
    client = genai.Client(
        api_key=api_key,
        http_options={'timeout': 120000}
    )
    system_prompt = build_system_prompt()
    user_prompt = build_user_prompt(idea)
    
    config = types.GenerateContentConfig(
        system_instruction=system_prompt,
        response_mime_type="application/json",
        response_schema=campaign_package_schema,
    )
    
    max_retries = 3
    is_fallback = False
    contents = []

    def _call_api(contents_arg, config_arg=None):
        try:
            return client.models.generate_content(
                model=model_id,
                contents=contents_arg,
                config=config_arg
            )
        except Exception as e:
            e_str = str(e).lower()
            if "api key" in e_str or "auth" in e_str or "400" in e_str or "401" in e_str or "403" in e_str:
                raise OrchestratorError(f"API/Auth Error: {e}")
            raise

    for attempt in range(max_retries + 1):
        try:
            if attempt == 0:
                try:
                    response = _call_api(user_prompt, config)
                    contents = [
                        types.Content(role="user", parts=[types.Part.from_text(text=user_prompt)])
                    ]
                except OrchestratorError:
                    raise
                except Exception as e:
                    # Fallback to prompt-only mode if structured output or system instruction is rejected
                    is_fallback = True
                    fallback_prompt = f"{system_prompt}\n\n{user_prompt}"
                    contents = [
                        types.Content(role="user", parts=[types.Part.from_text(text=fallback_prompt)])
                    ]
                    config = None  # Remove structured config
                    response = _call_api(contents, config)
            else:
                response = _call_api(contents, config)
            
            text = response.text
            
            # Strip accidental ```json fences
            if text.startswith("```"):
                lines = text.strip().splitlines()
                if lines and lines[0].startswith("```"):
                    lines = lines[1:]
                if lines and lines[-1].startswith("```"):
                    lines = lines[:-1]
                text = "\n".join(lines).strip()
                
            data = json.loads(text)
            package = CampaignPackage.model_validate(data)
            return package
            
        except (json.JSONDecodeError, ValidationError) as e:
            if attempt == max_retries:
                raise OrchestratorError(f"Failed to generate campaign after {max_retries} retries. Last error: {str(e)}")
            
            # Provide feedback for self-repair
            error_msg = f"Output validation failed:\n{str(e)}\n\nPlease correct the errors and output ONLY valid JSON matching the schema without any markdown formatting."
            
            text_to_append = text if 'text' in locals() else (response.text if 'response' in locals() else "")
            contents.append(types.Content(role="model", parts=[types.Part.from_text(text=text_to_append)]))
            contents.append(types.Content(role="user", parts=[types.Part.from_text(text=error_msg)]))
    
    raise OrchestratorError("Failed to generate campaign")
