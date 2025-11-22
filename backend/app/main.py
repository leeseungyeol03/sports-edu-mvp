from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models
from .database import engine
# routers 패키지에서 courses 모듈 추가 임포트
from .routers import users, equipment, rentals, courses, chat # chat 모듈 추가
import sys
import os
import traceback

# [디버깅] 현재 경로와 파일 위치 출력
print(f"DEBUG: Current working directory: {os.getcwd()}")
print(f"DEBUG: main.py location: {os.path.abspath(__file__)}")

# 경로 추가
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    from contextlib import asynccontextmanager

    # 여기서부터 실패할 가능성이 높음
    print("DEBUG: Importing models...")
    import models
    print("DEBUG: Importing database...")
    from database import engine
    print("DEBUG: Importing routers...")
    from routers import users, equipment, rentals, courses, chat
    print("DEBUG: All imports successful!")

except Exception as e:
    print("❌ FATAL ERROR during import:")
    traceback.print_exc() # 에러의 상세 내용을 로그에 출력
    raise e # 서버를 일부러 죽여서 로그를 남김

# 서버 시작 시 DB 연결 확인
@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        print("Attempting to connect to database...")
        models.Base.metadata.create_all(bind=engine)
        print("Database connected and tables created.")
    except Exception as e:
        print(f"❌ FATAL ERROR: Database connection failed: {e}")
    yield
    print("Server shutting down...")
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