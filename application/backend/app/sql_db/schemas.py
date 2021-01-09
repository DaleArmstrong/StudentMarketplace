import decimal
from typing import List
from datetime import datetime

from pydantic import BaseModel

from sqlalchemy import DateTime

"""
This file has the Pydantic models that are used to mirror the database tables as python objects.
This allows fastAPI to do some cool things like send http responses of json objects that match these classes.

Authors: Lukas Pettersson, Joseph Babel, Niall Healy
"""


# =====Category=====
class CategoryReturn(BaseModel):
    category: str = None

    class Config:
        orm_mode = True


class Category(CategoryReturn):
    id: int = None

    class Config:
        orm_mode = True


# =====Listing=====
class PhotoPath(BaseModel):
    id: int = None
    path: str = None
    thumbnailPath: str = None
    listing_id: int = None

    class Config:
        orm_mode = True


class Listing(BaseModel):  # Reading to return from API
    id: int = None
    seller_id: int = None
    timestamp: datetime = datetime.now()
    photoPaths: List[PhotoPath] = []

    name: str
    description: str
    price: int
    course: str = None
    category_id: int = None
    category: Category = None
    isApproved: bool = None
    isActive: bool = None

    class Config:
        orm_mode = True  # Read as ORM model


class AllListings(BaseModel):
    listings: List[Listing] = []
    listings_count: int
    zero_found: int

    class Config:
        orm_mode = True


# =====Message=====
class Message(BaseModel):
    id: int
    seller_id: int
    listing_id: int
    timestamp: datetime
    message: str

    class Config:
        orm_mode = True


# =====User=====
class UserBase(BaseModel):
    email: str
    timestamp: datetime = datetime.now()


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    password_hash: str
    listings: List[Listing] = []
    messages: List[Message] = []
    isAdmin: bool

    class Config:
        orm_mode = True
