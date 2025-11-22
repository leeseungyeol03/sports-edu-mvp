from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# --- Token ---
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str # 토큰 발급 시 역할 정보도 줌

class TokenData(BaseModel):
    username: Optional[str] = None

# --- User ---
class UserBase(BaseModel):
    username: str
    affiliation: str
    name: Optional[str] = None

class UserCreate(UserBase):
    password: str
    admin_code: Optional[str] = None # 관리자 코드 필드 추가

class User(UserBase):
    user_id: int
    role: str # 응답에 역할 포함
    class Config:
        from_attributes = True

# User Update Schemas
class UserUpdate(BaseModel):
    name: Optional[str] = None
    affiliation: Optional[str] = None

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str

# --- Equipment ---
class EquipmentBase(BaseModel):
    name: str
    category: str
    rating: Optional[float] = 0.0
    review_count: Optional[int] = 0
    badge: Optional[str] = None
    total_qty: int
    available_qty: int
    rental_fee: int
    description: Optional[str] = None
    image_url: Optional[str] = None

class EquipmentCreate(EquipmentBase): # 장비 등록용 스키마
    instructor_id: Optional[int] = None # 강사 ID 추가

class Equipment(EquipmentBase):
    equip_id: int
    instructor_id: Optional[int] = None
    instructor: Optional[User] = None
    class Config:
        from_attributes = True

# --- Rental ---
class RentalCreate(BaseModel):
    equip_id: int
    start_date: datetime
    end_date: datetime
    reason: str

class Rental(BaseModel):
    rental_id: int
    user_id: int
    equip_id: int
    status: str
    start_date: datetime
    end_date: datetime
    equipment: Optional[Equipment] = None 
    # 사용자 정보 포함 (관리자 페이지용)
    user: Optional[User] = None
    class Config:
        from_attributes = True

# --- Course ---
class CourseBase(BaseModel):
    title: str
    content_type: str
    duration: Optional[str] = None # Explicitly set default to None
    content_url: str
    description: Optional[str] = None

class CourseCreate(CourseBase): # 강의 등록용
    equip_id: int # 연결할 장비 ID는 필수로 변경 (requirement 1.B.2)

class Course(CourseBase):
    course_id: int
    class Config:
        from_attributes = True

# --- ChatMessage ---
class ChatMessageBase(BaseModel):
    sender_id: int
    receiver_id: int
    rental_id: int # Add rental_id
    message: str

class ChatMessageCreate(ChatMessageBase):
    pass

class ChatMessage(ChatMessageBase):
    id: int
    timestamp: datetime
    
    # Nested User schemas to show sender/receiver info
    sender: User
    receiver: User
    rental: Optional[Rental] = None # Optional relationship to Rental

    class Config:
        from_attributes = True