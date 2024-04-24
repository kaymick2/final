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