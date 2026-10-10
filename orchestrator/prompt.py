def build_system_prompt() -> str:
    return """You are an expert marketing campaign orchestrator.
Your job is to turn raw, messy campaign ideas into a complete, structured marketing asset package.
You must return the result EXACTLY as a JSON object matching the required schema.
Do NOT output any prose, explanations, or markdown fences (do not wrap in ```json).
Every image prompt you generate must include details about style, lighting, composition, and aspect ratio.
Handle messy, short, or Hinglish ideas gracefully by inferring appropriate professional marketing details.

"""

def build_user_prompt(idea: str) -> str:
    return f"""Campaign idea: {idea}
Generate the complete campaign package in JSON format."""
