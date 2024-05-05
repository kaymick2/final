from fastapi import FastAPI, HTTPException, Depends, status,Form,File, UploadFile
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm, HTTPBearer, HTTPAuthorizationCredentials


from pydantic import BaseModel
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
from typing import List, Optional
from pymongo import MongoClient
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from bson import ObjectId  # Import ObjectId
from pydantic import ConfigDict, BaseModel, Field, EmailStr
from pydantic.functional_validators import BeforeValidator
from typing_extensions import Annotated
from fastapi import Query
from fastapi.staticfiles import StaticFiles
import os
import shutil
import json

# MongoDB Connection
client = MongoClient("mongodb+srv://kaymickx17:as2final25!@ka4x.fablnpj.mongodb.net/")
db=client["BookReviews"]
users_collection = db["users"]
reviews_collection = db["reviews"] 
books_collection = db["books"] 
UPLOAD_FOLDER = "./static/uploads/"

# FastAPI app
app = FastAPI()
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
# Mount the static folder to serve uploaded images
app.mount("/static", StaticFiles(directory="static"), name="static")

# Password Hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Config
SECRET_KEY = "jjoasdojoasdjo"
ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
PyObjectId = Annotated[str, BeforeValidator(str)]


# MongoDB Models
class UserInDB(BaseModel):
    
    username: str
    password_hash: str
    is_admin: bool


class User(BaseModel):
   
    username: str
    password_hash: str

    is_admin: bool = Field(default=False)


class Book(BaseModel):
    
    title: str
    isbn: str
    author:PyObjectId
    thumbnail: str

class Review(BaseModel):
   
    book_id: str
    user_id: PyObjectId
    rating: int
    description: str


class ReviewCollection(BaseModel):  # Renamed from BookCollection to ReviewCollection
    reviews: List[Review] = []

class UserCollection(BaseModel):
    users: List[User] = []

class BookCollection(BaseModel):
    users: List[Book] = []


# Password Hashing Functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


# JWT Token Functions
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=3650)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = get_user(username=username)
    if user is None:
        raise credentials_exception
    return user


def get_user(username: str):
    user = users_collection.find_one({"username": username})
    if user:
        return user


async def get_current_admin_user(credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())):
    token = credentials.credentials
    user = await get_current_user(token)
    if not user['is_admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return user


# Routes
@app.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user or user['is_admin']== True:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(days=3650)
    access_token = create_access_token(
        data={"sub": user['username']}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


def authenticate_user(username: str, password: str):
    user = get_user(username)
    
    if not user:
        return False
    if not verify_password(password,user['password_hash']):
        return False
    return user


@app.post("/admin/token")  # New admin login endpoint
async def admin_login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_admin(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(days=3650)
    access_token = create_access_token(
        data={"sub": user['username']}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


def authenticate_admin(username: str, password: str):
    user = get_user(username)
    if not user:
        return False
    if not verify_password(password, user['password_hash']):
        return False
    if not user['is_admin']:
        return False
    return user


@app.post("/register", response_model=UserCollection, response_model_by_alias=False)
async def register_user(form_data: OAuth2PasswordRequestForm = Depends()):
    existing_user = users_collection.find_one({"username": form_data.username})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )
    password = get_password_hash(form_data.password)

    user = users_collection.insert_one({
        "username": form_data.username,
        "password_hash": password,
        "is_admin":False

    })
    return user

@app.post("/books/")
async def create_book(title: str = Form(...), isbn: str = Form(...),  thumbnail: UploadFile = File(...),current_user: UserInDB = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You need to be logged in to view reviews",
        )
    try:
       
       
        
        # Insert the book into the books collection
        result =  books_collection.insert_one({
            "title": title,
            "isbn": isbn,
            "author": ObjectId(current_user['_id']),
            "thumbnail": thumbnail.filename
        })
        
        with open(f"{UPLOAD_FOLDER}{thumbnail.filename}", "wb") as buffer:
            shutil.copyfileobj(thumbnail.file, buffer)

        # If insertion is successful, return the inserted document ID
        if result.inserted_id:
            return {"message": "Book created successfully", "document_id": str(result.inserted_id)}
        else:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create book")
    except Exception as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@app.get("/books/", response_model=BookCollection, response_model_by_alias=False)
async def get_books(current_user: UserInDB = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You need to be logged in to view reviews",
        )

    # Aggregate books with user information for each book's author
    pipeline = [
       
        {"$lookup": {
            "from": "users",
            "localField": "author",
            "foreignField": "_id",
            "as": "author_info"
        }},
        {"$unwind": "$author_info"},
        {"$project": {
            "title": 1,
            "isbn": 1,
            "thumbnail": 1,
            "author":1,
            "author_info.username": 1,
            "author_info._id": 1

        }}
    ]

   
    
    #Execute aggregation pipeline
    books_with_users =list(books_collection.aggregate(pipeline))
    books = []
    for book in books_with_users:
        books.append({
            "_id":str(book['_id']),
            "title": book['title'],
            "isbn": book['isbn'],
            "thumbnail": book['thumbnail'],
            "is_owner":str(book['author']) == str(current_user['_id']),
            "author_info": {
                "username": book['author_info']['username'],
                "_id": str(book['author_info']['_id'])
            }
        })

   
   
    return JSONResponse(status_code=200, content={"books":books})



@app.delete("/books/{book_id}")
async def delete_book(book_id: str,current_user: UserInDB = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You need to be logged in to view reviews",
        )
    result =  books_collection.delete_one({"_id": ObjectId(book_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")
    else:
        return {"message": "Book deleted successfully"}



@app.get("/books/{book_id}", response_model=Book)
async def get_book(book_id: str,current_user: UserInDB = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You need to be logged in to view reviews",
        )

     # Fetch book details from MongoDB
    book = books_collection.find_one({"_id": ObjectId(book_id)})
    if book is None:
        raise HTTPException(status_code=404, detail="Book not found")

    # Fetch author details from MongoDB
    author = users_collection.find_one({"_id": book['author']})
    if author is None:
        raise HTTPException(status_code=404, detail="Author not found")

    return  JSONResponse(status_code=200, content={"book":{
        "_id":str(book['_id']),
        "title": book['title'],
        "isbn": book['isbn'],
        "is_owner":str(book['author']) == str(current_user['_id']),
        "thumbnail": book['thumbnail'],
        "author_info": {
            "username": author['username'],
            "_id": str(author['_id'])
        }
    }})


@app.put("/books/{book_id}")
async def update_book(
    book_id: str,
    title: str = Form(...),
    isbn: str = Form(...),
    current_user: UserInDB = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You need to be logged in to view reviews",
        )
    # Convert book_id to ObjectId
    try:
        book_id = ObjectId(book_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid book ID")

    # Update the book in the database
    result = books_collection.update_one(
        {"_id": book_id},
        {"$set": {"title": title, "isbn": isbn}}
    )

    # Check if the book was found and updated
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Book not found")

    return {"message": "Book updated successfully"}

@app.post("/reviews/")
async def create_review(description: str = Form(...), rating: int = Form(...),book_id:str=Form(...),current_user: UserInDB = Depends(get_current_user)):
    
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You need to be logged in to create a review",
        )

    print(description)

    
    review = reviews_collection.insert_one({
      
        "user_id":ObjectId(current_user['_id']),
        "description": description,
        "rating": rating,
        "book_id": ObjectId(book_id)
    })
    return {
        "message":"Inserted"
    }


@app.get("/reviews", response_model=ReviewCollection, response_model_by_alias=False)
async def get_reviews(book_id: str = Query(None, description="ID of the book to get reviews for"), current_user: UserInDB = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You need to be logged in to view reviews",
        )
    
    pipeline = [
        {
            "$match": {"book_id": ObjectId(book_id)} if book_id else {}
        },
        {
            "$lookup": {
                "from": "users",  # Name of the users_collection
                "localField": "user_id",  # Field in reviews_collection
                "foreignField": "_id",  # Field in users_collection
                "as": "author"  # Alias for the joined documents
            }
        },
        {
            "$unwind": "$author"  # Unwind the author array created by the lookup stage
        },
        {
            "$project": {
                "_id": 1,
                "description": 1,
                "rating": 1,
                "user_id": 1,
                "author": {
                    "username": "$author.username"
                }
            }
        }
    ]

    reviews = list(reviews_collection.aggregate(pipeline))
    reviews_data = []

    for review in reviews:
      
        if '_id' in review:
            reviews_data.append({
                "_id": str(review['_id']),
                "description": review.get('description', ''),
                "rating": review.get('rating', ''),
                "is_owner":str(review.get('user_id')) == str(current_user['_id']),
                "author": review.get('author', ''),
            })
        else:
            print("Missing _id field in review:", review)

    return JSONResponse(status_code=201, content={"reviews": reviews_data})



# API endpoint to delete a review
@app.delete("/reviews/{review_id}")
async def delete_review(review_id: str, current_user: UserInDB = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You need to be logged in to view reviews",
        )
    # Convert review_id to ObjectId
    try:
        review_id = ObjectId(review_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid review ID")

    # Delete the review from the database
    result = reviews_collection.delete_one({"_id": review_id})

    # Check if the review was found and deleted
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")

    return {"message": "Review deleted successfully"}

@app.put("/reviews/")
async def update_review(
    review_id: str=Form(...),
    description: str = Form(...),
    rating: int = Form(...), current_user: UserInDB = Depends(get_current_user)
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You need to be logged in to view reviews",
        )
    # Convert review_id to ObjectId
    try:
        review_id = ObjectId(review_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid review ID")

    # Update the review in the database
    result = reviews_collection.update_one(
        {"_id": review_id},
        {"$set": {"description": description, "rating": rating}}
    )

    # Check if the review was found and updated
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")

    return {"message": "Review updated successfully"}    






# Admin Related Routes Start




@app.get("/admin/books/", response_model=BookCollection, response_model_by_alias=False)
async def admin_get_books(current_user: UserInDB = Depends(get_current_admin_user)):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You need to be logged in to view reviews",
        )
   

    # Aggregate books with user information for each book's author
    pipeline = [
       
        {"$lookup": {
            "from": "users",
            "localField": "author",
            "foreignField": "_id",
            "as": "author_info"
        }},
        {"$unwind": "$author_info"},
        {"$project": {
            "title": 1,
            "isbn": 1,
            "thumbnail": 1,
            "author":1,
            "author_info.username": 1,
            "author_info._id": 1

        }}
    ]

   
    
    #Execute aggregation pipeline
    books_with_users =list(books_collection.aggregate(pipeline))
    books = []
    for book in books_with_users:
        books.append({
            "_id":str(book['_id']),
            "title": book['title'],
            "isbn": book['isbn'],
            "thumbnail": book['thumbnail'],
            "is_owner":str(book['author']) == str(current_user['_id']),
            "author_info": {
                "username": book['author_info']['username'],
                "_id": str(book['author_info']['_id'])
            }
        })

   
   
    return JSONResponse(status_code=200, content={"books":books})



@app.delete("/admin/books/{book_id}")
async def admin_delete_book(book_id: str,current_user: UserInDB = Depends(get_current_admin_user)):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You need to be logged in to view reviews",
        )
    result =  books_collection.delete_one({"_id": ObjectId(book_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")
    else:
        return {"message": "Book deleted successfully"}



@app.get("/admin/books/{book_id}", response_model=Book)
async def admin_get_book(book_id: str,current_user: UserInDB = Depends(get_current_admin_user)):
     # Fetch book details from MongoDB
    book = books_collection.find_one({"_id": ObjectId(book_id)})
    if book is None:
        raise HTTPException(status_code=404, detail="Book not found")

    # Fetch author details from MongoDB
    author = users_collection.find_one({"_id": book['author']})
    if author is None:
        raise HTTPException(status_code=404, detail="Author not found")

    return  JSONResponse(status_code=200, content={"book":{
        "_id":str(book['_id']),
        "title": book['title'],
        "isbn": book['isbn'],
        "is_owner":str(book['author']) == str(current_user['_id']),
        "thumbnail": book['thumbnail'],
        "author_info": {
            "username": author['username'],
            "_id": str(author['_id'])
        }
    }})


@app.put("/admin/books/{book_id}")
async def admin_update_book(
    book_id: str,
    title: str = Form(...),
    isbn: str = Form(...),
    current_user: UserInDB = Depends(get_current_admin_user)):

    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You need to be logged in to view reviews",
        )


    # Convert book_id to ObjectId
    try:
        book_id = ObjectId(book_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid book ID")

    # Update the book in the database
    result = books_collection.update_one(
        {"_id": book_id},
        {"$set": {"title": title, "isbn": isbn}}
    )

    # Check if the book was found and updated
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Book not found")

    return {"message": "Book updated successfully"}



@app.get("/admin/reviews", response_model=ReviewCollection, response_model_by_alias=False)
async def admin_get_reviews(book_id: str = Query(None, description="ID of the book to get reviews for"), current_user: UserInDB = Depends(get_current_admin_user)):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You need to be logged in to view reviews",
        )
    
    pipeline = [
        {
            "$match": {"book_id": ObjectId(book_id)} if book_id else {}
        },
        {
            "$lookup": {
                "from": "users",  # Name of the users_collection
                "localField": "user_id",  # Field in reviews_collection
                "foreignField": "_id",  # Field in users_collection
                "as": "author"  # Alias for the joined documents
            }
        },
        {
            "$unwind": "$author"  # Unwind the author array created by the lookup stage
        },
        {
            "$project": {
                "_id": 1,
                "description": 1,
                "rating": 1,
                "user_id": 1,
                "author": {
                    "username": "$author.username"
                }
            }
        }
    ]

    reviews = list(reviews_collection.aggregate(pipeline))
    reviews_data = []

    for review in reviews:
      
        if '_id' in review:
            reviews_data.append({
                "_id": str(review['_id']),
                "description": review.get('description', ''),
                "rating": review.get('rating', ''),
               
                "author": review.get('author', ''),
            })
        else:
            print("Missing _id field in review:", review)

    return JSONResponse(status_code=201, content={"reviews": reviews_data})



# API endpoint to delete a review
@app.delete("/admin/reviews/{review_id}")
async def admin_delete_review(review_id: str, current_user: UserInDB = Depends(get_current_admin_user)):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You need to be logged in to view reviews",
        )
    # Convert review_id to ObjectId
    try:
        review_id = ObjectId(review_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid review ID")

    # Delete the review from the database
    result = reviews_collection.delete_one({"_id": review_id})

    # Check if the review was found and deleted
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")

    return {"message": "Review deleted successfully"}

@app.put("/admin/reviews/")
async def update_review(
    review_id: str=Form(...),
    description: str = Form(...),
    rating: int = Form(...), current_user: UserInDB = Depends(get_current_admin_user)
    ):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You need to be logged in to view reviews",
        )

    # Convert review_id to ObjectId
    try:
        review_id = ObjectId(review_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid review ID")

    # Update the review in the database
    result = reviews_collection.update_one(
        {"_id": review_id},
        {"$set": {"description": description, "rating": rating}}
    )

    # Check if the review was found and updated
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")

    return {"message": "Review updated successfully"}    


