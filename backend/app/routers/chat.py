import sys
import os
# 상위 폴더 경로 추가 (Import Error 방지)
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import logging
from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session, joinedload
from typing import List
import json
from datetime import datetime
from zoneinfo import ZoneInfo # Import ZoneInfo

from .. import models, schemas, database, auth
from ..connection_manager import manager # Import the new manager

# Add logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.websocket("/ws/{rental_id}/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    rental_id: int,
    current_user: models.User = Depends(auth.get_user_from_token_query),
    db: Session = Depends(database.get_db)
):
    user_id = current_user.user_id
    
    # Basic validation
    rental = db.query(models.Rental).filter(models.Rental.rental_id == rental_id).first()
    if not rental:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Invalid rental.")
        return

    # Check if the user is part of this rental conversation (either the user who rented or the instructor)
    is_admin_instructor = user_id == rental.equipment.instructor_id
    is_renter = user_id == rental.user_id

    if not is_admin_instructor and not is_renter:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Not authorized for this chat.")
        return

    await manager.connect(websocket, str(rental_id))
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            message_content = message_data.get("message")
            
            # Determine receiver
            receiver_id = rental.equipment.instructor_id if is_renter else rental.user_id

            if not message_content:
                continue

            # Save message to DB with KST timestamp
            chat_message = models.ChatMessage(
                sender_id=user_id,
                receiver_id=receiver_id,
                rental_id=rental_id,
                message=message_content,
                timestamp=datetime.now(ZoneInfo("Asia/Seoul"))
            )
            db.add(chat_message)
            db.commit()
            db.refresh(chat_message)

            full_chat_message = db.query(models.ChatMessage).options(
                joinedload(models.ChatMessage.sender),
                joinedload(models.ChatMessage.receiver),
                joinedload(models.ChatMessage.rental).options(
                    joinedload(models.Rental.user),
                    joinedload(models.Rental.equipment).options(
                        joinedload(models.Equipment.instructor_user)
                    )
                )
            ).filter(models.ChatMessage.id == chat_message.id).one()

            full_message = jsonable_encoder(full_chat_message)
            
            logger.info(f"Broadcasting message: {full_message} to rental_id: {rental_id}") # Added log
            await manager.broadcast(json.dumps(full_message), str(rental_id))

    except WebSocketDisconnect:
        logger.info(f"WebSocketDisconnect for rental_id: {rental_id}") # Changed print to logger.info
        manager.disconnect(websocket, str(rental_id))
    except Exception as e:
        logger.error(f"WebSocket error for rental_id {rental_id}: {e}", exc_info=True) # Changed print to logger.error with exc_info
        manager.disconnect(websocket, str(rental_id))

@router.get("/history/{rental_id}", response_model=List[schemas.ChatMessage])
def get_chat_history(
    rental_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    # Ensure user is part of the rental to view history
    rental = db.query(models.Rental).filter(models.Rental.rental_id == rental_id).first()
    if not rental or (current_user.user_id != rental.user_id and current_user.user_id != rental.equipment.instructor_id):
        raise HTTPException(status_code=403, detail="Not authorized to view this chat history.")

    history = db.query(models.ChatMessage).options(
        joinedload(models.ChatMessage.sender),
        joinedload(models.ChatMessage.receiver)
    ).filter(
        models.ChatMessage.rental_id == rental_id
    ).order_by(models.ChatMessage.timestamp).all()
            
    return history

@router.get("/rooms", response_model=List[schemas.Rental])
def get_chat_rooms(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="관리자만 채팅방 목록을 조회할 수 있습니다.")

    # Find rentals where the current admin is the instructor and there are chat messages
    rentals_with_chats = db.query(models.Rental).join(models.Equipment).join(
        models.ChatMessage, models.Rental.rental_id == models.ChatMessage.rental_id
    ).filter(
        models.Equipment.instructor_id == current_user.user_id
    ).options(
        joinedload(models.Rental.user),
        joinedload(models.Rental.equipment)
    ).distinct().all()

    return rentals_with_chats