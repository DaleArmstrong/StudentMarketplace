
from starlette.responses import RedirectResponse
from app.sql_db import crud, schemas
from app.sql_db.database import get_db

from fastapi import APIRouter, Depends
from fastapi.responses import HTMLResponse

from sqlalchemy.orm import Session

from typing import List

"""
This file contains the routers for the search results page and getting categories from the server

Authors: Joesph Babel, Aaron Lander
"""

# instantiates an APIRouter
router = APIRouter()


# returns a JSON formatted response of listings from the %like search
@router.get("/search/", response_model=schemas.AllListings)
async def read_listings(keywords: str, category: str, sort: str = 'id', skip: int = 0, limit: int = 15, db: Session = Depends(get_db)):
    results_list = crud.get_listings_for_search(db, keywords, category, sort)
    zeroFound = 0
    if len(results_list) == 0:
        zeroFound = 1
        results_list = crud.get_listings_for_search(db, "", category, sort)

    response_object = {
        "listings": results_list[skip: skip + limit],
        "listings_count": len(results_list),
        "zero_found": zeroFound,
    }
    return response_object


# returns results html page
@router.get("/results/", response_class=HTMLResponse)
async def get_results_page():
    with open("../html/results.html") as f:
        html = f.read()

    return html


# returns list of categories
@router.get("/categories/", response_model=List[schemas.CategoryReturn])
async def get_categories(db: Session = Depends(get_db)):
    return crud.get_all_categories(db)
