from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from .. import models, schemas, database, auth
import logging

router = APIRouter()

# Add logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.get("/", response_model=List[schemas.Equipment])
def read_equipment(skip: int = 0, limit: int = 100, category: str = None, db: Session = Depends(database.get_db)):
    try:
        query = db.query(models.Equipment).options(joinedload(models.Equipment.instructor_user))
        if category and category != 'ALL':
            query = query.filter(models.Equipment.category == category)
        return query.offset(skip).limit(limit).all()
    except Exception as e:
        logger.error(f"Error in read_equipment: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

# [관리자] 장비 등록
@router.post("/", response_model=schemas.Equipment)
def create_equipment(item: schemas.EquipmentCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="관리자만 등록할 수 있습니다.")
    
    try:
        logger.info(f"Received item: {item}")
        item_dict = item.dict(exclude={'instructor'})
        item_dict['instructor_id'] = current_user.user_id
        logger.info(f"Item dictionary: {item_dict}")
        
        new_equip = models.Equipment(**item_dict)
        db.add(new_equip)
        db.commit()
        db.refresh(new_equip)
        return new_equip
    except Exception as e:
        logger.error(f"Error in create_equipment: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")