---
name: orchestrator
description: A standalone AI marketing campaign generator that takes an unstructured idea and returns a strictly typed JSON campaign package containing a title, audience, color palette, image prompts, and social copy. Use this skill when you need to expand a raw concept into a full set of marketing assets.
---

# Campaign Asset Orchestrator Skill

This module is a decoupled prompt construction and schema validation engine. It uses Gemma 4 (via the Gemini API) to enforce strict JSON output, augmented by a self-repairing validation loop using Pydantic.

## Inputs
- `idea` (string): The raw, unstructured campaign concept (e.g., "A bakery introducing festive gift boxes"). Must be 5-500 characters.

## Outputs
Returns a `CampaignPackage` object (validated by Pydantic) matching the schema in `orchestrator/schema.py`:
- `campaign_title` (str)
- `tagline` (str)
- `target_audience` (str)
- `color_palette` (List of {name: str, hex: str})
- `image_prompts` (List of {asset_type: str, prompt: str, aspect_ratio: str})
- `social_copy` (List of {platform: str, caption: str, hashtags: List[str]})

## Usage Examples

### Python Import
```python
from orchestrator import generate_campaign

package = generate_campaign("A student drama club street play about health awareness")
print(package.campaign_title)
```

### CLI
```bash
python -m orchestrator "A bakery introducing festive gift boxes"
```

## Mock Mode
For local development or testing without making real API calls, set the `MOCK_MODE` environment variable to `true`.
```bash
MOCK_MODE=true python -m orchestrator "A bakery introducing festive gift boxes"
```
When `MOCK_MODE=true`, the skill will bypass the Gemini API, returning a hardcoded, realistic `CampaignPackage` object instantly.

## Limitations
- **API Availability:** Depends on the availability of the Gemma 4 / Gemini API. If the API is unreachable or rate-limited, you will need to rely on `MOCK_MODE` or implement backoff/retries at the caller level.
- **Quotas:** Generating campaigns consumes tokens. Be mindful of your Gemini API quotas.
- **Latency:** Because the model generates a comprehensive JSON package, requests can take a few seconds to complete when not in `MOCK_MODE`.
