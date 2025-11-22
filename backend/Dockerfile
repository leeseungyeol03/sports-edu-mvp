# Python 3.9 이미지 사용
FROM python:3.9-slim

# [추가] 로그가 버퍼링 없이 즉시 출력되도록 설정
ENV PYTHONUNBUFFERED=1

# /app 디렉토리 생성 (WORKDIR 대신)
RUN mkdir /app
# /app 디렉토리를 PYTHONPATH에 추가 (ENTRYPOINT에서 참조할 수 있도록)
ENV PYTHONPATH=/app

# 의존성 파일 복사 및 설치
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r /app/requirements.txt


# 소스 코드 복사
COPY . /app/

# ENTRYPOINT를 사용하여 애플리케이션 시작 (render.yaml의 startCommand를 우회)
# set -x 를 사용하여 실행되는 모든 명령어 로깅
ENTRYPOINT ["bash", "-c", "set -ex && cd /app && python -c \"print('Starting Python application with verbose debug output:'); import os; import sys; print(f'PYTHONPATH: {os.environ.get(\'PYTHONPATH\')}'); print(f'sys.path: {sys.path}'); from app import main\" && uvicorn app.main:app --host 0.0.0.0 --port $PORT"]