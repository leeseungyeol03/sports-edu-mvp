# Python 3.9 이미지 사용
FROM python:3.9-slim

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 파일 복사 및 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 소스 코드 복사
COPY . .

# 포트 노출 (Render는 기본적으로 10000 포트 사용)
EXPOSE 10000

# 앱 실행 명령어
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]