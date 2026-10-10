from enum import Enum
from pydantic import BaseModel, Field, field_validator
from typing import List, Dict, Any, Optional, Literal

class AssetType(str, Enum):
    poster = "Poster"
    instagram_square = "Instagram Square"
    banner = "Banner"

class AspectRatio(str, Enum):
    ratio_4_5 = "4:5"
    ratio_1_1 = "1:1"
    ratio_16_9 = "16:9"

class Platform(str, Enum):
    instagram = "Instagram"
    linkedin = "LinkedIn"
    twitter = "Twitter"

class ColorSwatch(BaseModel):
    name: str
    hex: str = Field(..., pattern=r"^#[0-9A-Fa-f]{6}$")

class ImagePrompt(BaseModel):
    asset_type: AssetType
    prompt: str
    aspect_ratio: AspectRatio

class SocialCopy(BaseModel):
    platform: Platform
    caption: str
    hashtags: List[str]

    @field_validator('hashtags')
    @classmethod
    def check_hashtags(cls, v: List[str]) -> List[str]:
        for tag in v:
            if not tag.startswith('#'):
                raise ValueError(f"Hashtag '{tag}' must start with '#'")
        return v

class CampaignPackage(BaseModel):
    campaign_title: str
    tagline: str
    target_audience: str
    color_palette: List[ColorSwatch] = Field(..., min_length=4, max_length=6)
    image_prompts: List[ImagePrompt] = Field(..., min_length=3)
    social_copy: List[SocialCopy] = Field(..., min_length=3)

# Export the JSON schema for use as a response schema
campaign_package_schema: Dict[str, Any] = CampaignPackage.model_json_schema()
