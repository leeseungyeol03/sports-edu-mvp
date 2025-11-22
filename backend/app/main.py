from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError
import time # Import time for sleep
import logging # Import logging

from app import models # Changed from . import models
from app.database import engine # Changed from .database import engine
# routers 패키지에서 courses 모듈 추가 임포트
from app.routers import users, equipment, rentals, courses, chat # Changed from .routers import ...

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# DB 테이블 생성 (Retry mechanism)
MAX_RETRIES = 5
RETRY_DELAY = 5 # seconds

for i in range(MAX_RETRIES):
    try:
        logger.info(f"Attempt {i+1}/{MAX_RETRIES}: Creating database tables...")
        models.Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully.")
        break # Exit loop if successful
    except OperationalError as e:
        logger.error(f"Database connection failed on attempt {i+1}/{MAX_RETRIES}: {e}")
        if i < MAX_RETRIES - 1:
            logger.info(f"Retrying in {RETRY_DELAY} seconds...")
            time.sleep(RETRY_DELAY)
        else:
            logger.error("Max retries reached. Could not connect to database.")
            raise # Re-raise the exception after max retries

app = FastAPI(title="SportsEdu API", description="Udemy 스타일 공공체육 공유 플랫폼")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(equipment.router, prefix="/api/equipment", tags=["equipment"])
app.include_router(rentals.router, prefix="/api/rentals", tags=["rentals"])
# courses 라우터 등록 (이제 /courses URL로 접근 가능)
app.include_router(courses.router, prefix="/api/courses", tags=["courses"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"]) # chat 라우터 등록

@app.get("/health")
def health_check():
    return {"status": "ok"}