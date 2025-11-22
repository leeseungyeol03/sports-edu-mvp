from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
import enum

# 사용자 권한 정의
class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    USER = "USER"

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)
    affiliation = Column(String)
    name = Column(String, nullable=True)
    role = Column(String, default=UserRole.USER)
    
    rentals = relationship("Rental", back_populates="user")
    chat_messages_sent = relationship("ChatMessage", foreign_keys="ChatMessage.sender_id", back_populates="sender")
    chat_messages_received = relationship("ChatMessage", foreign_keys="ChatMessage.receiver_id", back_populates="receiver")
    instructed_equipment = relationship("Equipment", back_populates="instructor_user")

class Equipment(Base):
    __tablename__ = "equipment"

    equip_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    category = Column(String)
    instructor_id = Column(Integer, ForeignKey("users.user_id"), nullable=True) # New foreign key for instructor
    rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    badge = Column(String, nullable=True)
    total_qty = Column(Integer, default=0)
    available_qty = Column(Integer, default=0)
    rental_fee = Column(Integer, default=0)
    description = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)

    instructor_user = relationship("User", back_populates="instructed_equipment") # Relationship to User model
    rentals = relationship("Rental", back_populates="equipment")
    courses = relationship("EquipmentCourse", back_populates="equipment")

    @property
    def instructor(self):
        return self.instructor_user

class RentalStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    RETURNED = "RETURNED"
    CANCELLED = "CANCELLED"

class Rental(Base):
    __tablename__ = "rentals"

    rental_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    equip_id = Column(Integer, ForeignKey("equipment.equip_id"))
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    status = Column(String, default=RentalStatus.PENDING)
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="rentals")
    equipment = relationship("Equipment", back_populates="rentals")

class Course(Base):
    __tablename__ = "courses"

    course_id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(Text, nullable=True)
    content_type = Column(String)
    duration = Column(String, nullable=True)
    content_url = Column(String)
    
    equipments = relationship("EquipmentCourse", back_populates="course")

class EquipmentCourse(Base):
    __tablename__ = "equipment_courses"

    id = Column(Integer, primary_key=True, index=True)
    equip_id = Column(Integer, ForeignKey("equipment.equip_id"))
    course_id = Column(Integer, ForeignKey("courses.course_id"))

    equipment = relationship("Equipment", back_populates="courses")
    course = relationship("Course", back_populates="equipments")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.user_id"))
    receiver_id = Column(Integer, ForeignKey("users.user_id"))
    rental_id = Column(Integer, ForeignKey("rentals.rental_id"), nullable=True) # New rental_id foreign key
    message = Column(Text)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    sender = relationship("User", foreign_keys=[sender_id], back_populates="chat_messages_sent")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="chat_messages_received")
    rental = relationship("Rental") # New rental relationship