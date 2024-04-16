import uvicorn
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from book import book_router

app = FastAPI()

@app.get("/")
async def read_index():
    return FileResponse("./frontend/main.html")

app.include_router(book_router)

app.mount("/", StaticFiles(directory="frontend"), name="static")