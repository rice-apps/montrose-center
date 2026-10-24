"""
Sets up HTTP routes for the chat contract.
Written by Peter Golovakov :P
"""

from fastapi import APIRouter, HTTPException

from app.dependencies import ChatServiceDep
from app.schemas.chats import Chat, ChatCreate, ChatSummary, ChatUpdate, MessageCreate, SendMessageResponse

router = APIRouter(prefix="/chats", tags=["chats"])


@router.post("", response_model=Chat)
def create_chat(payload: ChatCreate, service: ChatServiceDep) -> Chat:
    """ 
    Calls the chat service to create a new chat
    Sends a POST request to the backend
    """
    return service.create_chat(payload.title)

@router.get("", response_model=list[ChatSummary])
def list_chats(service: ChatServiceDep) -> list[ChatSummary]: 
    """ 
    Calls the chat service to receive a list of all chats
    Sends a GET request to the backend
    """
    return service.list_chats()

@router.get("", response_model=Chat)
def get_chat(chat_id: str, service: ChatServiceDep) -> Chat:
    """ 
    Calls the chat service to get a specified chat
    Sends a GET request to the backend
    Raises a 404 error if the chat of the specified ID does not exist
    """
    chat = service.get_chat(chat_id)
    if chat is None: raise HTTPException(status_code=404, detail="Chat does not exist")
    return chat

@router.put("", response_model=Chat)
def update_chat(chat_id: str, payload: ChatUpdate, service: ChatServiceDep) -> Chat:
    """ 
    Calls the chat service to update the title of a specified chat
    Sends a PUT request to the backend
    Raises a 404 error if the chat of the specified ID does not exist
    """
    chat = service.update_chat_title(chat_id, payload.title)
    if chat is None: raise HTTPException(status_code=404, detail="Chat does not exist")
    return chat

@router.put("", response_model=SendMessageResponse)
async def send_message(
    chat_id: str, payload: MessageCreate, service: ChatServiceDep
) -> SendMessageResponse:
    """ 
    Calls the chat service to send a message in a specified chat 
    Sends a PUT request to the backend
    Raises a 404 error if the chat of the specified ID does not exist
    """
    message = await service.send_message(chat_id, payload.content)
    if message is None: raise HTTPException(status_code=404, detail="Cannot send message")
    return message
