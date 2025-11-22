# Python 3.9 이미지 사용
FROM python:3.9-slim

# [추가] 로그가 버퍼링 없이 즉시 출력되도록 설정
ENV PYTHONUNBUFFERED=1

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 파일 복사 및 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 소스 코드 복사
COPY . .