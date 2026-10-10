import pytest
import os
import json
import importlib
from unittest.mock import patch, MagicMock
from pydantic import ValidationError

from orchestrator.schema import CampaignPackage
from orchestrator.client import generate_campaign, OrchestratorError

def test_schema_valid():
    data = {
        "campaign_title": "Test Campaign",
        "tagline": "Test tagline for campaign",
        "target_audience": "Everyone",
        "color_palette": [
            {"name": "Color 1", "hex": "#123456"},
            {"name": "Color 2", "hex": "#abcdef"},
            {"name": "Color 3", "hex": "#000000"},
            {"name": "Color 4", "hex": "#FFFFFF"}
        ],
        "image_prompts": [
            {"asset_type": "Poster", "prompt": "a", "aspect_ratio": "4:5"},
            {"asset_type": "Instagram Square", "prompt": "b", "aspect_ratio": "1:1"},
            {"asset_type": "Banner", "prompt": "c", "aspect_ratio": "16:9"}
        ],
        "social_copy": [
            {"platform": "Instagram", "caption": "c", "hashtags": ["#a"]},
            {"platform": "LinkedIn", "caption": "c", "hashtags": ["#b"]},
            {"platform": "Twitter", "caption": "c", "hashtags": ["#c"]}
        ]
    }
    pkg = CampaignPackage.model_validate(data)
    assert pkg.campaign_title == "Test Campaign"

def test_schema_bad_hex():
    data = {
        "campaign_title": "Test",
        "tagline": "Test tagline",
        "target_audience": "Everyone",
        "color_palette": [
            {"name": "Color 1", "hex": "123456"}, # Missing '#'
            {"name": "Color 2", "hex": "#abcdef"},
            {"name": "Color 3", "hex": "#000000"},
            {"name": "Color 4", "hex": "#FFFFFF"}
        ],
        "image_prompts": [
            {"asset_type": "Poster", "prompt": "a", "aspect_ratio": "4:5"},
            {"asset_type": "Instagram Square", "prompt": "b", "aspect_ratio": "1:1"},
            {"asset_type": "Banner", "prompt": "c", "aspect_ratio": "16:9"}
        ],
        "social_copy": [
            {"platform": "Instagram", "caption": "c", "hashtags": ["#a"]},
            {"platform": "LinkedIn", "caption": "c", "hashtags": ["#b"]},
            {"platform": "Twitter", "caption": "c", "hashtags": ["#c"]}
        ]
    }
    with pytest.raises(ValidationError) as exc:
        CampaignPackage.model_validate(data)
    assert "String should match pattern '^#[0-9A-Fa-f]{6}$'" in str(exc.value)

def test_schema_bad_enum():
    data = {
        "campaign_title": "Test",
        "tagline": "Test tagline",
        "target_audience": "Everyone",
        "color_palette": [
            {"name": "c1", "hex": "#123456"},
            {"name": "c2", "hex": "#abcdef"},
            {"name": "c3", "hex": "#000000"},
            {"name": "c4", "hex": "#FFFFFF"}
        ],
        "image_prompts": [
            {"asset_type": "BadType", "prompt": "a", "aspect_ratio": "4:5"},
            {"asset_type": "Instagram Square", "prompt": "b", "aspect_ratio": "1:1"},
            {"asset_type": "Banner", "prompt": "c", "aspect_ratio": "16:9"}
        ],
        "social_copy": [
            {"platform": "Instagram", "caption": "c", "hashtags": ["#a"]},
            {"platform": "LinkedIn", "caption": "c", "hashtags": ["#b"]},
            {"platform": "Twitter", "caption": "c", "hashtags": ["#c"]}
        ]
    }
    with pytest.raises(ValidationError) as exc:
        CampaignPackage.model_validate(data)
    assert "Input should be" in str(exc.value)

@patch("orchestrator.client.genai.Client")
def test_retry_loop(mock_client_class, monkeypatch):
    monkeypatch.setenv("GEMMA_MODEL", "gemma-4")
    
    mock_client = MagicMock()
    mock_client_class.return_value = mock_client
    
    valid_data = {
        "campaign_title": "Retry Success",
        "tagline": "Test tagline",
        "target_audience": "Everyone",
        "color_palette": [
            {"name": "c1", "hex": "#123456"},
            {"name": "c2", "hex": "#abcdef"},
            {"name": "c3", "hex": "#000000"},
            {"name": "c4", "hex": "#FFFFFF"}
        ],
        "image_prompts": [
            {"asset_type": "Poster", "prompt": "a", "aspect_ratio": "4:5"},
            {"asset_type": "Instagram Square", "prompt": "b", "aspect_ratio": "1:1"},
            {"asset_type": "Banner", "prompt": "c", "aspect_ratio": "16:9"}
        ],
        "social_copy": [
            {"platform": "Instagram", "caption": "c", "hashtags": ["#a"]},
            {"platform": "LinkedIn", "caption": "c", "hashtags": ["#b"]},
            {"platform": "Twitter", "caption": "c", "hashtags": ["#c"]}
        ]
    }
    
    mock_resp_1 = MagicMock(text='{"bad": "json"')
    mock_resp_2 = MagicMock(text=json.dumps({"color_palette": []})) # ValidationError
    mock_resp_3 = MagicMock(text=f"```json\n{json.dumps(valid_data)}\n```")
    
    mock_client.models.generate_content.side_effect = [
        mock_resp_1, mock_resp_2, mock_resp_3
    ]
    
    pkg = generate_campaign("Test idea")
    
    assert pkg.campaign_title == "Retry Success"
    assert mock_client.models.generate_content.call_count == 3
