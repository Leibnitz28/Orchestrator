# Open-Source Campaign Asset Orchestrator

> Turn a raw, messy campaign idea into a complete, structured marketing asset package, powered by open-weight **Gemma 4** through the Gemini API.

Built at **Hacktoberfest Hack Day Hamirpur** (NIT Hamirpur Chapter x GDG Ludhiana, in partnership with Major League Hacking).

---

## Screenshots

*(Placeholder for dashboard UI GIF / screenshots - please add here)*

## What it does

You type one unstructured sentence:

- "A student drama club street play on August 15 about health awareness"
- "A bakery introducing festive gift boxes"

The orchestrator returns a ready-to-use package:

| Asset | Details |
|---|---|
| Campaign title and tagline | A core hook for the whole campaign |
| Target audience | Who the campaign should speak to |
| Color palette | Named swatches with hex codes (click to copy) |
| Visual generation prompts | Image-generator-ready prompts with style, lighting, composition and aspect ratio |
| Social media copy | Captions, hashtags and calls to action for Instagram, LinkedIn and Twitter |

Small teams, student clubs and local businesses often have the idea but not the time or design budget to turn it into assets. This tool closes that gap with an open model anyone can run and inspect.

## Architecture

Two decoupled layers, plus a standalone orchestrator module:

 ```
 React + Vite + Tailwind          FastAPI backend                 Gemma 4
 ┌───────────────────┐  POST   ┌──────────────────────┐  SDK   ┌───────────────┐
 │  Dashboard (UI)   │ ──────► │ /api/generate-campaign│ ─────► │ Gemini API    │
 │  presets + output │ ◄────── │  uses /orchestrator   │ ◄───── │               │
 └───────────────────┘  JSON   └──────────────────────┘        └───────────────┘
 ```

- **Backend (agent harness):** exposes a single endpoint, builds the JSON-enforcing prompt, calls Gemma 4, validates the response, and retries with a self-repair loop if validation fails.
- **Frontend dashboard:** a minimal, high-contrast UI with a textarea, quick-fill presets, and a modular output view.
- **`/orchestrator` module:** prompt construction and schema validation, isolated from the web layer so it can be imported into any pipeline or run as a CLI.

## Output schema

Every response is validated against this contract before it reaches the client:

```json
{
  "campaign_title": "string",
  "tagline": "string",
  "target_audience": "string",
  "color_palette": [{ "name": "string", "hex": "#RRGGBB" }],
  "image_prompts": [
    {
      "asset_type": "Poster | Instagram Square | Banner",
      "prompt": "string",
      "aspect_ratio": "4:5 | 1:1 | 16:9"
    }
  ],
  "social_copy": [
    {
      "platform": "Instagram | LinkedIn | Twitter",
      "caption": "string",
      "hashtags": ["#tag1", "#tag2"]
    }
  ]
}
```

### How we aim for zero JSON parse errors

1. Structured output mode (JSON MIME type plus response schema) where the model supports it.
2. A strict system prompt that demands JSON only, with no prose or markdown fences.
3. Schema validation (Pydantic), including a hex-code regex `^#[0-9A-Fa-f]{6}$` and enum checks.
4. Automatic retry, feeding validation errors back to the model for self-repair.

## Tech stack

- **Model:** Google Gemma 4 (open weights) via the Gemini API and the Google Gen AI SDK
- **Backend:** Python, FastAPI, Pydantic
- **Frontend:** React, Vite, Tailwind CSS
- **License:** MIT

## Getting started

### Prerequisites

- Python 3.10+
- Node.js 18+
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### Backend

```bash
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # add your GEMINI_API_KEY and GEMMA_MODEL
uvicorn backend.app.main:app --reload
```

API docs are available at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Environment variables

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Your Gemini API key |
| `GEMMA_MODEL` | The Gemma 4 model ID served by the Gemini API |
| `MOCK_MODE` | Set to `true` to skip real API calls during local dev |

### Demo / Offline Mode

If you are demoing this project during judging and run into network issues or API quota limits, you can run the app in **offline demo mode**:
1. Open `.env` and set `MOCK_MODE=true`
2. Restart the backend (`uvicorn backend.app.main:app --reload`)
3. The app will bypass the Gemini API and instantly return a rich, pre-generated campaign package. This is a built-in safety net to ensure you can always showcase the UI and data flow during a live pitch!

## Known Limitations

- **API Availability**: Relies on the Gemini API for generation. If the API is unreachable, rate-limited, or out of quota, generation will fail. Use `MOCK_MODE=true` as a fallback.
- **Latency**: Because the model generates a comprehensive JSON package, requests can take 5-15 seconds to complete.

## Usage

### REST API

```bash
curl -X POST http://localhost:8000/api/generate-campaign \
  -H "Content-Type: application/json" \
  -d '{"idea": "A bakery introducing festive gift boxes"}'
```

### Use the orchestrator on its own

```python
from orchestrator import generate_campaign

package = generate_campaign("A student drama club street play about health awareness")
print(package.campaign_title)
```

### CLI

```bash
python -m orchestrator "A bakery introducing festive gift boxes"
```

## Agent Skill

The `/orchestrator` directory ships with a `SKILL.md` so it can be dropped into any agent that supports the Agent Skill Open Standard. Developers can reuse the prompt builder and validator without touching the web app.

## Project structure

```
.
├── backend/
│   └── app/               # FastAPI app and endpoint
├── orchestrator/          # Standalone skill / CLI module
│   ├── SKILL.md
│   ├── prompt.py          # JSON-enforcing prompt construction
│   ├── schema.py          # Pydantic models and validation
│   └── client.py          # Gemma 4 call and retry loop
├── frontend/              # React + Vite + Tailwind dashboard
├── LICENSE
└── README.md
```

## Roadmap

- Image upload (logo, venue photo, old poster) so Gemma 4 can derive palette and style from visuals
- Export the full package as PDF or JSON
- More platforms and regional languages for social copy
- Plug-in system for custom asset types

## Contributing

Contributions are welcome, especially from first-time open-source contributors. Open an issue to discuss an idea, or send a pull request.

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit your changes
4. Open a pull request

## License

Released under the [MIT License](LICENSE).

## Acknowledgements

- Hacktoberfest Hack Day Hamirpur, NIT Hamirpur Chapter and GDG Ludhiana
- Major League Hacking
- The Gemma team at Google for open-weight models
