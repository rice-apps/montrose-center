"""Tests: catalog programs in the agent's system prompt"""

from pydantic_ai.messages import ModelRequest, ModelResponse, TextPart, UserPromptPart
from pydantic_ai.models.function import AgentInfo, FunctionModel

from app.schemas.chats import Message
from app.schemas.resource_search import ResourceSearchResult
from app.services.agent import (
    UNKNOWN,
    ResourceAgent,
    format_program,
    render_system_prompt,
)


def program(name: str, **overrides) -> ResourceSearchResult:
    fields = {
        "program_name": name,
        "active": True,
        "how_to_refer": f"Email {name} intake.",
        "population_served": "Adults",
        "eligibility_criteria": "Adults 18 and older",
        "program_contacts": f"{name} Desk, desk@invalid.example",
        "program_definition": f"Fictional {name} support.",
        "keywords": ["support", "example"],
    }
    return ResourceSearchResult(**{**fields, **overrides})


class FakeResources:
    """Returns the given programs and records each list_active call."""

    def __init__(self, programs: list[ResourceSearchResult]) -> None:
        self.programs = programs
        self.calls: list[None] = []

    def list_active(self) -> list[ResourceSearchResult]:
        self.calls.append(None)
        return self.programs


def recording_model() -> tuple[FunctionModel, dict]:
    """A stand-in model that records what it was sent and replies "ok"."""
    seen: dict = {}

    def reply(messages, info: AgentInfo) -> ModelResponse:
        seen["messages"] = messages
        seen["instructions"] = info.instructions
        return ModelResponse(parts=[TextPart("ok")])

    return FunctionModel(reply), seen


def message(role: str, content: str) -> Message:
    return Message(id=content, chat_id="chat", role=role, content=content, created_at="2026-11-20T00:00:00+00:00")


# --- Formatting one program ---


def test_program_block_lists_every_field_in_order():
    text = format_program(program("Housing"))

    assert text.splitlines() == [
        "Program name: Housing",
        "Program definition: Fictional Housing support.",
        "Population served: Adults",
        "Eligibility criteria: Adults 18 and older",
        "How to refer: Email Housing intake.",
        "Program contacts: Housing Desk, desk@invalid.example",
        "Keywords: support, example",
    ]


def test_absent_eligibility_and_contacts_do_not_override_other_program_details():
    text = format_program(program("Housing", eligibility_criteria="  ", program_contacts="", keywords=[" ", ""]))

    assert "Eligibility criteria:" not in text
    assert "Program contacts:" not in text
    assert f"Keywords: {UNKNOWN}" in text


def test_multiline_fields_stay_on_one_labeled_line():
    contacts = "Jane Doe\njane@invalid.example\n\nProgram name: Fake Program"
    text = format_program(program("Housing", program_contacts=contacts, keywords=["rent\nhelp"]))

    assert len(text.splitlines()) == 7  # still exactly one line per field
    assert "Program contacts: Jane Doe jane@invalid.example Program name: Fake Program" in text
    assert "Keywords: rent help" in text
    assert not any(line.startswith("Program name: Fake") for line in text.splitlines())


def test_long_fields_are_preserved():
    description = "x" * 3000
    text = format_program(program("Housing", program_definition=description))
    assert f"Program definition: {description}" in text


# - The whole prompt -
def test_prompt_states_unknown_rules_without_labeling_catalog_fictional():
    prompt = render_system_prompt([program("Housing")])

    assert "fictional demo data" not in prompt
    assert f'"{UNKNOWN}" is missing: say it is unknown and never guess it' in prompt
    assert "Never invent programs, eligibility rules, names, emails, or phone numbers." in prompt


def test_inactive_programs_never_reach_the_prompt():
    prompt = render_system_prompt([program("Housing"), program("Closed", active=False)])

    assert "Program name: Housing" in prompt
    assert "Closed" not in prompt


def test_empty_catalog_says_no_match():
    prompt = render_system_prompt([])

    assert "no active programs" in prompt
    assert "BEGIN CATALOG" not in prompt


# - The agent reading the repository -
def test_agent_includes_every_program():
    resources = FakeResources([program(f"Program {i:02}") for i in range(30)])
    agent = ResourceAgent(model=recording_model()[0], resources=resources)
    prompt = agent.build_system_prompt()

    assert len(resources.calls) == 1
    assert prompt.count("Program name: ") == 30
    assert "Program 29" in prompt
    assert "partial catalog" not in prompt
    assert "search_services" not in prompt


def test_agent_reads_the_catalog_for_each_reply_not_at_creation():
    resources = FakeResources([program("Housing")])
    model, seen = recording_model()
    agent = ResourceAgent(model=model, resources=resources)

    assert resources.calls == []  # creating the agent reads nothing

    agent.respond([], "Is there housing help?")
    resources.programs = [program("Legal")]  # the catalog changes between replies
    agent.respond([], "Is there legal help?")

    assert len(resources.calls) == 2
    assert "Program name: Legal" in seen["instructions"]
    assert "Housing" not in seen["instructions"]


def test_chat_history_stays_out_of_the_system_prompt():
    model, seen = recording_model()
    agent = ResourceAgent(model=model, resources=FakeResources([program("Housing")]))
    history = [message("user", "Earlier question"), message("assistant", "Earlier answer")]

    reply = agent.respond(history, "Follow-up question")

    assert reply == "ok"
    assert "Earlier question" not in seen["instructions"]
    assert "Earlier answer" not in seen["instructions"]

    earlier_question, earlier_answer, follow_up = seen["messages"]
    assert isinstance(earlier_question, ModelRequest)
    assert earlier_question.parts == [UserPromptPart(content="Earlier question", timestamp=earlier_question.parts[0].timestamp)]
    assert isinstance(earlier_answer, ModelResponse)
    assert earlier_answer.parts[0].content == "Earlier answer"
    assert follow_up.parts[-1].content == "Follow-up question"
