from datetime import timedelta, datetime
from os import environ

import jwt
from jwt import PyJWTError
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.hash import bcrypt
from pydantic import BaseModel
from sqlalchemy.orm import Session
from starlette import status

from app.sql_db import crud
from app.sql_db.database import get_db

"""
This file contains the logic for logging a user in: creating auth tokens, getting current user from auth token, 
decrypting password, etc.

Author: Niall Healy with much help from the FastAPI tutorial
"""

router = APIRouter()

# Variables used for password encryption
SECRET_KEY = environ.get('CSC648WEBSITE_SECRET_KEY')
ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 30
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

MAX_USERS = 50
LOGGED_IN_USERS = 0
LOGGED_IN_TOKENS = []


# Used as the response model for the login post router
class Token(BaseModel):
    access_token: str
    token_type: str


@router.post("/", response_model=Token)
async def login_for_access_token(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    global LOGGED_IN_USERS
    global LOGGED_IN_TOKENS

    user = authenticate_user(db, form_data.username, form_data.password)
    flush_out_inactive()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if LOGGED_IN_USERS < MAX_USERS:
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        LOGGED_IN_TOKENS.append(access_token)
        LOGGED_IN_USERS += 1
    else:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Too many users logged in",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return {"access_token": access_token, "token_type": "bearer"}


def flush_out_inactive():
    global LOGGED_IN_TOKENS
    global LOGGED_IN_USERS

    ACTIVE_USERS = []

    for token in LOGGED_IN_TOKENS:
        try:
            jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            ACTIVE_USERS.append(token)
        except Exception as e:
            LOGGED_IN_USERS -= 1

    LOGGED_IN_TOKENS = ACTIVE_USERS


# Checks if the email and password correspond to a valid user in the db
def authenticate_user(db: Session, email: str, password: str):
    user = crud.get_user_by_email(db, email)
    retVal = user
    if user is None:
        retVal = None
    elif not bcrypt.verify(password, user.password_hash):
        retVal = None

    return retVal


# Build authentication token to pass to front end
def create_access_token(*, data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# Used to get the user associated with an auth token. Called by other routers when an auth token is sent by the frontend
# for example posting a listing
async def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        # print(payload)
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except PyJWTError as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="PyJWTError",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = crud.get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    return user
