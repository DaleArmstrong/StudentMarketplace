from fastapi import FastAPI
import uvicorn

from starlette.responses import RedirectResponse
from starlette.staticfiles import StaticFiles

from app.routers import search, register, login, listing, message, index

from app.sql_db import models

from app.sql_db.database import SessionLocal, engine

"""
This is the main file that runs the app, it builds the tables in the database, instantiates the fastAPI app,
redirects the root of the site to the homepage, includes the router in the app, and mounts static files

Author: Lukas Pettersson
"""

# build tables in the database
models.Base.metadata.create_all(bind=engine)

# create an instance of the fastAPI app
app = FastAPI()


# redirect root of the site to our homepage

@app.get("/")
async def root():
    return RedirectResponse(url='/html/index.html')

# include the routers
app.include_router(search.router)

app.include_router(index.router)

app.include_router(
    listing.router,
    prefix="/listing",
    tags=["listing"]
)

app.include_router(
    listing.router,
    prefix="/profile",
    tags=["profile"]
)

app.include_router(
    login.router,
    prefix="/login",
    tags=["login"]
)

app.include_router(
    register.router,
    prefix="/register",
    tags=["register"]
)

app.include_router(
    search.router,
    prefix="/search",
    tags=["search"]
)

app.include_router(
    message.router,
    prefix="/message",
    tags=["message"]
)

# mount static files
app.mount("/", StaticFiles(directory=".."), name="static")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
