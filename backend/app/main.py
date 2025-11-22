from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models
from .database import engine
# routers 패키지에서 courses 모듈 추가 임포트
from .routers import users, equipment, rentals, courses, chat # chat 모듈 추가

# DB 테이블 생성
models.Base.metadata.create_all(bind=engine)

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