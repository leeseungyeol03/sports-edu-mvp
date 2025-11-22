from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from .. import models, schemas, database, auth

router = APIRouter()

# [사용자] 대여 신청
@router.post("/", response_model=schemas.Rental)
def create_rental(rental: schemas.RentalCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    try:
        equip = db.query(models.Equipment).filter(models.Equipment.equip_id == rental.equip_id).first()
        if not equip or equip.available_qty < 1:
            raise HTTPException(status_code=400, detail="장비 재고가 부족합니다.")
        
        db_rental = models.Rental(
            **rental.dict(), 
            user_id=current_user.user_id, 
            status=models.RentalStatus.PENDING
        )
        equip.available_qty -= 1
        
        db.add(db_rental)
        db.commit()
        db.refresh(db_rental)
        return db_rental
    except Exception as e:
        print(f"Error in create_rental: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


# [사용자] 내 대여 목록
@router.get("/my", response_model=List[schemas.Rental])
def read_my_rentals(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    try:
        return db.query(models.Rental).filter(models.Rental.user_id == current_user.user_id).options(joinedload(models.Rental.equipment).joinedload(models.Equipment.instructor_user)).all()
    except Exception as e:
        print(f"Error in read_my_rentals: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


# [관리자] 전체 대여 요청 목록 (대기중인 건 위주)
@router.get("/all", response_model=List[schemas.Rental])
def read_all_rentals(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="관리자 권한이 필요합니다.")
    try:
        return db.query(models.Rental).options(
            joinedload(models.Rental.user), 
            joinedload(models.Rental.equipment).joinedload(models.Equipment.instructor_user)
        ).order_by(models.Rental.created_at.desc()).all()
    except Exception as e:
        print(f"Error in read_all_rentals: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


# [관리자] 대여 승인
@router.put("/{rental_id}/approve")
def approve_rental(rental_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="관리자 권한이 필요합니다.")
    
    try:
        rental = db.query(models.Rental).filter(models.Rental.rental_id == rental_id).first()
        if not rental:
            raise HTTPException(status_code=404, detail="신청 건을 찾을 수 없습니다.")
        
        rental.status = models.RentalStatus.APPROVED
        db.commit()
        return {"message": "Approved successfully"}
    except Exception as e:
        print(f"Error in approve_rental: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")