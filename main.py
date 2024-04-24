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
PyObjectd = Annotated[str, BeforeValidator(str)]

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
    users: List[User] = []


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