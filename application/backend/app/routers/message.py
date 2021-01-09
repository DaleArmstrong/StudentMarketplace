from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.routers.login import get_current_user

from app.sql_db import schemas, crud
from app.sql_db.database import get_db

from pydantic import BaseModel

from typing import List
"""
This file contains routers for messaging.

Authors: Lukas Pettersson, Aaron Lander
"""

router = APIRouter()


class Message(BaseModel):
    message: str
    listing_id: int


@router.post("/", response_model=schemas.Message)
async def create_message(message: Message,
                         db: Session = Depends(get_db)):
    return crud.create_message(db, message.message, message.listing_id)


# get router for pictures returns all messages as message schemas
@router.get("/", response_model=List[schemas.Message])
async def get_message_by_seller_id(db: Session = Depends(get_db),
                                   user: schemas.User = Depends(get_current_user)):
    return crud.get_message_by_seller_id(db, user)
