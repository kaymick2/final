from pydantic import BaseModel

class Book(BaseModel):
    id: int
    title: str
    author: str
    description: str

class Review(BaseModel):
    title: str
    author: str
    description: str