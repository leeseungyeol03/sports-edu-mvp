from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas, database, auth

router = APIRouter()

@router.get("/", response_model=List[schemas.Course])
def read_courses(
    skip: int = 0, 
    limit: int = 100, 
    equip_id: Optional[int] = None, 
    db: Session = Depends(database.get_db)
):
    query = db.query(models.Course)
    
    if equip_id:
        query = query.join(models.EquipmentCourse).filter(models.EquipmentCourse.equip_id == equip_id)
        
    return query.offset(skip).limit(limit).all()

@router.get("/my", response_model=List[schemas.Course])
def read_my_courses(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    approved_rentals = db.query(models.Rental).filter(
        models.Rental.user_id == current_user.user_id,
        models.Rental.status == models.RentalStatus.APPROVED
    ).all()

    approved_equip_ids = [rental.equip_id for rental in approved_rentals]

    if not approved_equip_ids:
        return []

    courses = db.query(models.Course).join(models.EquipmentCourse).filter(
        models.EquipmentCourse.equip_id.in_(approved_equip_ids)
    ).all()
    
    return courses

@router.get("/{course_id}", response_model=schemas.Course)
def read_course(course_id: int, db: Session = Depends(database.get_db)):
    course = db.query(models.Course).filter(models.Course.course_id == course_id).first()
    if course is None:
        raise HTTPException(status_code=404, detail="해당 강의를 찾을 수 없습니다.")
    return course

@router.post("/", response_model=schemas.Course, status_code=status.HTTP_201_CREATED)
def create_course(
    course: schemas.CourseCreate, 
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="관리자만 강의를 생성할 수 있습니다.")
    
    equipment = db.query(models.Equipment).filter(models.Equipment.equip_id == course.equip_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="연결할 장비를 찾을 수 없습니다.")

    new_course = models.Course(
        title=course.title,
        description=course.description,
        content_type=course.content_type,
        duration=course.duration,
        content_url=course.content_url
    )
    db.add(new_course)
    db.commit()
    db.refresh(new_course)

    equipment_course_link = models.EquipmentCourse(
        equip_id=course.equip_id,
        course_id=new_course.course_id
    )
    db.add(equipment_course_link)
    db.commit()

    return new_course