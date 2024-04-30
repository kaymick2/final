from fastapi import FastAPI, HTTPException, Depends, status,Form
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm, HTTPBearer, HTTPAuthorizationCredentials


from pydantic import BaseModel
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
from typing import List, Optional
from pymongo import MongoClient
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from bson import ObjectId 
from pydantic import ConfigDict, BaseModel, Field, EmailStr
from pydantic.functional_validators import BeforeValidator
from typing_extensions import Annotated

client = MongoClient("mongodb+srv://kaymickx17:as2final25!@ka4x.fablnpj.mongodb.net/?retryWrites=true&w=majority&appName=KA4X")
db=client["bookish"]
userscoll=db["users"]
reviewscoll=db["reviews"]
thumbnail=db["covers"]

app=FastAPI()
origins=["*"]

app.add_middleware(CORSMiddleware,allow_origins=origins,allow_credentials=True,allow_methods=["*"],allow_headers=["*"])

#password hashing
pwd_context=CryptContext(schemes=["bcrypt"],deprecated="auto")

#jwt
SECRET_KEY = "66568560338b14221aa1c8c78caf19a9064a74e8bf32ef35d86cc051617c622b"
ALGORITHM = "HS256"


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
PyObjectId = Annotated[str, BeforeValidator(str)]

class UserInDB(BaseModel):
    username:str
    password_hash:str
    is_admin:bool
    
class User(BaseModel):
    username: str
    is_admin: bool = Field(default=False)

class Review(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    title: str
    description: str
    thumbnail: str
    review: str
    author: str

class ReviewCollection(BaseModel):
    reviews: List[Review] = []
    
class UserCollection(BaseModel):
    users: List[User] = []
  
#class ThumbnailCollection(BaseModel):
 #   covers:List[Thumbnails]=[]

# Password functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

# JWT Token functions
def create_access_token(data: dict, expires_delta: Optional[timedelta]=None):
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
    user = userscoll.find_one({"username": username})
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
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(days=3650)
    access_token = create_access_token(data={"sub": user['username']}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}

def authenticate_user(username: str, password: str):
    user = get_user(username)

    if not user:
        return False
    if not verify_password(password, user['password_hash']):
        return False
    return user

@app.post("/admin/token")
async def admin_login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_admin(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(days=3650)
    access_token = create_access_token(data={"sub": user['username']}, expires_delta=access_token_expires)
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
    existing_user = userscoll.find_one({"username": form_data.username})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )
    password = get_password_hash(form_data.password)

    user = userscoll.insert_one({
        "username": form_data.username,
        "password_hash": password,
        "is_admin": False
    })
    return user

@app.post("/reviews")
async def create_review(title: str = Form(...), description: str = Form(...), review: str = Form(...), thumbnail: str = Form(...), current_user: UserInDB = Depends(get_current_user)):

    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You need to be logged in to create a review",
        )
    
    user = userscoll.find_one({"username": current_user['username']})
    review = reviewscoll.insert_one({
        "title": title,
        "author": user['_id'],
        "description": description,
        "thumbnail": thumbnail,
        "review": review,
    })
    return {"message": "Inserted"}

@app.get("/reviews", response_model=ReviewCollection, response_model_by_alias=False)
async def get_reviews(current_user: UserInDB = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You need to be logged in to view reviews",
        )
    pipeline = [
    {
        "$lookup": {
            "from": "users",  # Name of the userscoll
            "localField": "author",  # Field in reviewscoll
            "foreignField": "_id",  # Field in userscoll
            "as": "author"  # Alias for the joined documents
        }
    },
    {
        "$unwind": "$author"  # Unwind the author array created by the lookup stage
    },
    {
        "$project": {
            "_id": 1,
            "title": 1,
            "description": 1,
            "thumbnail": 1,
            "review": 1,
            "author":{
                "username":"$author.username"
            }
           
        }
    }
    ]

    reviews = list(reviewscoll.aggregate(pipeline))
    reviews_data = []

    for review in reviews:
        if '_id' in review:
            
            reviews_data.append({
                "_id":str(review['_id']),
                "title": review.get('title', ''),
                "thumbnail": review.get('thumbnail', ''),
                "description": review.get('description', ''),
                "review": review.get('review', ''),
                "author": review.get('author', ''),

            })
        else:
            print("Missing _id field in review:", review)

    
    
    return JSONResponse(status_code=201, content={"reviews": reviews_data})


@app.get("/admin/reviews", response_model=Review)
async def admin_get_reviews(current_user: UserInDB = Depends(get_current_admin_user)):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You need to be logged in as admin to view reviews",
        )
    pipeline = [
    {
        "$lookup": {
            "from": "users",  # Name of the userscoll
            "localField": "author",  # Field in reviewscoll
            "foreignField": "_id",  # Field in userscoll
            "as": "author"  # Alias for the joined documents
        }
    },
    {
        "$unwind": "$author"  # Unwind the author array created by the lookup stage
    },
    {
        "$project": {
            "_id": 1,
            "title": 1,
            "description": 1,
            "thumbnail": 1,
            "review": 1,
            "author":{
                "username":"$author.username"
            }
           
        }
    }
    ]

    reviews = list(reviewscoll.aggregate(pipeline))
    reviews_data = []

    for review in reviews:
        if '_id' in review:
            
            reviews_data.append({
                "_id":str(review['_id']),
                "title": review.get('title', ''),
                "thumbnail": review.get('thumbnail', ''),
                "description": review.get('description', ''),
                "review": review.get('review', ''),
                "author": review.get('author', ''),

            })
        else:
            print("Missing _id field in review:", review)

    
    
    return JSONResponse(status_code=201, content={"reviews": reviews_data})


@app.delete("/reviews/{review_id}")
async def delete_review(review_id: str, current_user: UserInDB = Depends(get_current_admin_user)):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You need to be logged in to delete a review",
        )
    result = reviewscoll.delete_one({"_id": ObjectId(review_id)})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found",
        )
    return {"message": "Review deleted successfully"}

@app.get("/admin/reviews/{review_id}", response_model=Review)
async def get_review(review_id: str):
    if not ObjectId.is_valid(review_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid review ID")
    
    review = reviewscoll.find_one({"_id":ObjectId(review_id)})
    
    
    return JSONResponse(status_code=201, content={"review": {
        "id":str(review['_id']),
        "title":review['title'],
        "description":review['description'],
        "thumbnail":review['thumbnail'],
        "review":review['review'],
        
    }})


@app.put("/reviews/{review_id}")
async def update_review(
    review_id: str, title: str = Form(...),description: str = Form(...), review: str = Form(...),thumbnail: str = Form(...), current_user: UserInDB = Depends(get_current_admin_user)
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You need to be logged in to update a review",
        )
    print("Review id:",review_id)
    result = reviewscoll.update_one({"_id": ObjectId(str(review_id))}, {"$set": {
        "title": title,
        "description": description,
        "thumbnail": thumbnail,
        "review": review
    }})
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found",
        )
    return {"message": "Review updated successfully"}

    