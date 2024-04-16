from fastapi import APIRouter, HTTPException, status
from model import Book, Review
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

book_router = APIRouter()

book_list = []
max_id: int = 0

@book_router.post("/books", status_code=status.HTTP_201_CREATED)
async def add_book(book: Review) -> dict:
    global max_id
    max_id += 1

    newBook = Book(id=max_id, title=book.title, author=book.author, description=book.description)
    book_list.append(newBook)
    json_data = newBook.model_dump()
    return JSONResponse(json_data, status_code=status.HTTP_201_CREATED)

@book_router.get("/books")
async def get_books() -> dict:
    json_data = jsonable_encoder(book_list)
    return JSONResponse(content=json_data)

@book_router.get("/books/{author}/{title}")
async def get_book_by_title(author: str, title: str) -> Book:
    for book in book_list:
        if book.author == author and book.title == title:
            return book
        
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"The book titled {title} authored by {author} has not been found",
        )
    
@book_router.put("/books/{author}/{title}")
async def update_review(review: Review):
    for x in book_list:
        if x.author == review.author and x.title == review.title:
            x.description = review.description
            return{"message": "Book review updated successfully"}
        
    return {"message": "The book titled {title} authored by {author} has not been found"}

@book_router.delete("/books/{author}/{title}")
async def delete_book(author: str, title: str) -> dict:
    for i in range(len(book_list)):
        book = book_list[i]
        if book.author == author and book.title == title:
            book_list.pop(i)
            return {"message": "The book titled {title} authored by {author} has been deleted"}
        
    return {"message": "The book titled {title} authored by {author} has not been found"}
