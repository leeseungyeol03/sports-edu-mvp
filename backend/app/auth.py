import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status, Query, WebSocketException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from . import models, database

# --- 설정 (배포 시 환경변수로 관리 권장) ---
# 실제 운영에선 os.getenv("SECRET_KEY") 사용, 개발 시 기본값 제공
SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key-please-change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# 비밀번호 해싱 컨텍스트 (Bcrypt 사용)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 토큰 인증 방식 설정 (Header: Authorization: Bearer <token>)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/login")

# --- 유틸리티 함수 ---

def verify_password(plain_password, hashed_password):
    """입력된 비밀번호와 저장된 해시 비밀번호 비교"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str):
    """
    비밀번호 해싱.
    bcrypt는 72바이트를 초과하는 비밀번호를 처리할 수 없으므로,
    해싱 전에 비밀번호를 72바이트로 자릅니다.
    """
    return pwd_context.hash(password.encode('utf-8')[:72])

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """JWT 액세스 토큰 생성"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- 의존성 (Dependency) ---

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    """
    API 요청 시 헤더의 토큰을 검사하여 현재 로그인한 유저 객체를 반환.
    라우터 함수에서 current_user: models.User = Depends(get_current_user) 형태로 사용.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="자격 증명을 검증할 수 없습니다.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise credentials_exception
        
    return user

def get_user_from_token_query(token: str = Query(...), db: Session = Depends(database.get_db)):
    """
    WebSocket 연결 시 쿼리 파라미터의 토큰을 검사하여 현재 로그인한 유저 객체를 반환.
    """
    credentials_exception = WebSocketException(
        code=status.WS_1008_POLICY_VIOLATION,
        reason="자격 증명을 검증할 수 없습니다.",
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise credentials_exception
        
    return user