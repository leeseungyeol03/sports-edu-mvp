from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app import models, schemas, database, auth
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

ADMIN_SECRET_CODE = "team2002" # 관리자 인증 코드

@router.post("/signup", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    logger.info(f"Attempting to create user: {user.username}")
    
    # 1. 중복 확인
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        logger.warning(f"Username {user.username} already exists.")
        raise HTTPException(status_code=400, detail="이미 등록된 사용자명입니다.")
    
    # 2. 권한 설정 (관리자 코드 확인)
    user_role = models.UserRole.USER
    if user.admin_code and user.admin_code == ADMIN_SECRET_CODE:
        user_role = models.UserRole.ADMIN
    logger.info(f"Assigning role {user_role.value} to user {user.username}")

    try:
        # 3. 유저 생성
        hashed_password = auth.get_password_hash(user.password)
        new_user = models.User(
            username=user.username, 
            password_hash=hashed_password, 
            affiliation=user.affiliation,
            name=user.name,
            role=user_role.value # 역할 저장
        )
        logger.info(f"Creating new user object for {user.username}")
        db.add(new_user)
        logger.info(f"Adding user {user.username} to session")
        db.commit()
        logger.info(f"Committing user {user.username} to database")
        db.refresh(new_user)
        logger.info(f"User {user.username} created successfully")
        return new_user
    except Exception as e:
        logger.error(f"Error creating user {user.username}: {e}", exc_info=True)
        db.rollback()
        raise HTTPException(status_code=500, detail="유저 생성 중 서버 오류가 발생했습니다.")

@router.post("/login", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="아이디 또는 비밀번호가 일치하지 않습니다.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    # 응답에 role 정보도 포함해서 프론트가 알 수 있게 함
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}

@router.get("/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@router.put("/me", response_model=schemas.User)
def update_user_me(
    user_update: schemas.UserUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    if user_update.name:
        current_user.name = user_update.name
    if user_update.affiliation:
        current_user.affiliation = user_update.affiliation
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/me/password", status_code=status.HTTP_204_NO_CONTENT)
def update_password_me(
    password_update: schemas.PasswordUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    if not auth.verify_password(password_update.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="현재 비밀번호가 일치하지 않습니다.")
    
    current_user.password_hash = auth.get_password_hash(password_update.new_password)
    db.add(current_user)
    db.commit()
    return {"message": "비밀번호가 성공적으로 변경되었습니다."}