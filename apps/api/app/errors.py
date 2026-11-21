"""Application errors translated to HTTP responses by the routers."""


class InvalidChatInput(ValueError):
    """A chat title or message is blank."""


class ChatNotFound(LookupError):
    """The requested conversation does not exist."""


class AgentResponseError(RuntimeError):
    """The agent could not produce a usable answer."""
