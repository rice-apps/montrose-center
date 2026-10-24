"""Task 7: build a prompt from fictional data and call an LLM."""

import asyncio
import json
import os
from pathlib import Path

from dotenv import load_dotenv
from pydantic_ai import Agent
from pydantic_ai.messages import ModelMessage, ModelRequest, ModelResponse, TextPart, UserPromptPart
from pydantic_ai.models.google import GoogleModel
from pydantic_ai.providers.google import GoogleProvider

from app.schemas.chats import Message


# read the .env file and set the file locations
load_dotenv(Path(__file__).parents[2] / ".env")
DEFAULT_CATALOG_PATH = Path(__file__).parents[1] / "data" / "resources.json"

model = GoogleModel(
    os.environ["GEMINI_MODEL"],
    provider=GoogleProvider(api_key=os.environ["GEMINI_API_KEY"]),
)


# helpers functions :)
def load_catalog_from_json(path: Path) -> list[dict]:
    return json.loads(path.read_text(encoding="utf-8"))

def format_resource(resource: dict) -> str:
    return (
        f"Name: {resource['name']}\n"
        f"Program: {resource['program']}\n"
        f"Description: {resource['description']}\n"
        f"Population served: {resource['population_served']}\n"
        f"Eligibility: {resource['eligibility']}\n"
        f"Referral contact: {resource['referral_contact']}"
    )

def to_model_messages(history: list[Message]) -> list[ModelMessage]:
    # Convert saved chat messages into the objects that pydantic-ai needs
    converted: list[ModelMessage] = []
    for message in history:
        if message.role == "user":
            converted.append(ModelRequest(parts=[UserPromptPart(content=message.content)]))
        else:
            converted.append(ModelResponse(parts=[TextPart(content=message.content)]))
    return converted


# loads the catalog, builds the prompt, and answers questions
class ResourceAgent:
    def __init__(self, model, catalog_path: Path | None = None) -> None:
        self.catalog_path = catalog_path or DEFAULT_CATALOG_PATH
        self.catalog = load_catalog_from_json(self.catalog_path)
        self.system_prompt = self.build_system_prompt()
        self.agent = Agent(model, instructions=self.system_prompt)

    def build_system_prompt(self) -> str:
        rules = (
            "You help Montrose Center staff find services and referral contacts.\n"
            "Answer only from the resource list below.\n"
            "Copy contact details exactly as they appear in the list.\n"
            "Never invent a name, email, phone number, or address.\n"
            "If the list does not contain the answer, say so and suggest "
            "the staff member contact the program directly.\n"
            "The staff member decides what to do next; you do not make referrals."
        )
        resource_text = "\n\n".join(format_resource(r) for r in self.catalog)
        return f"{rules}\n\nResource list:\n\n{resource_text}"

    async def respond(self, history: list[Message], user_text: str) -> str:
        result = await self.agent.run(user_text, message_history=to_model_messages(history))
        return result.output


# Test code
if __name__ == "__main__":
    agent = ResourceAgent(model=model)

    print("System prompt:")
    print(agent.system_prompt)

    print("\nAgent answer:")
    result = asyncio.run(agent.agent.run("Is there housing help?"))
    print(repr(result.output))
    print(result.all_messages())