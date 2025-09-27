import os
import secrets
import string
import smtplib
import hashlib
from datetime import datetime, timedelta
from decimal import Decimal
from typing import List, Optional
from enum import Enum
import pytz # Import pytz for timezone handling
import requests
import json
import hmac
import httpx

# FastAPI and related imports
from fastapi import FastAPI, Depends, HTTPException, status, Request, Query
from fastapi.security import HTTPBearer
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi import Header
from fastapi.responses import RedirectResponse
from fastapi_utils.tasks import repeat_every

# Database imports
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Text, UniqueConstraint, create_engine, and_, or_, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker, Session
from sqlalchemy.types import DECIMAL as SQLDecimal
from sqlalchemy.orm import joinedload
from sqlalchemy import func
from fastapi import APIRouter  # Needed to create a router
from sqlalchemy import exists

# Authentication imports
from passlib.context import CryptContext
from jose import JWTError, jwt

# Email imports
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formataddr

# Pydantic imports
from pydantic import BaseModel, EmailStr, validator
from jinja2 import Environment, FileSystemLoader

# =============================================================================
# CONFIGURATION & CONSTANTS
# =============================================================================
required_env_vars = [
    "DATABASE_URL",
    "SECRET_KEY",
    "SMTP_SERVER",
    "SMTP_USERNAME",
    "SMTP_PASSWORD",
    "FROM_EMAIL",
    "FROM_NAME",
    "BASE_URL",
    "FRONTEND_BASE_URL",
    "ADMIN_EMAIL",
    "ADMIN_PASSWORD",
    "ADMIN_PIN",
    "APP_SECRET",
    "BITLABS_S2S_TOKEN",
    "BITLABS_APP_TOKEN",
    "CPX_RESEARCH_HASH",  # Removed CPX_RESEARCH_SECURE_HASH duplicate
    "ADGEM_POSTBACK_KEY",
    "ADGEM_BANNED_SECRET",
    "ADGEM_APP_ID",
    "CPX_RESEARCH_APP_ID"
]

missing_vars = [var for var in required_env_vars if not os.getenv(var)]
if missing_vars:
    raise RuntimeError(f"Missing required environment variables: {', '.join(missing_vars)}")
# Database Configuration

DATABASE_URL = os.getenv("DATABASE_URL")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256" # This is fine to default
ACCESS_TOKEN_EXPIRE_MINUTES = 30

SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587")) # Safe default
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
FROM_EMAIL = os.getenv("FROM_EMAIL", SMTP_USERNAME)
FROM_EMAIL = os.getenv("FROM_EMAIL", SMTP_USERNAME)
FROM_NAME = os.getenv("FROM_NAME")
BASE_URL = os.getenv("BASE_URL")
APP_SECRET = os.getenv("APP_SECRET")
S2S_TOKEN = os.getenv("BITLABS_S2S_TOKEN")
BITLABS_APP_TOKEN = os.getenv("BITLABS_APP_TOKEN")
BITLABS_BASE_URL = "https://web.bitlabs.ai"
CPX_RESEARCH_HASH = os.getenv("CPX_RESEARCH_HASH")
ADGEM_POSTBACK_KEY = os.getenv("ADGEM_POSTBACK_KEY")
ADGEM_BANNED_SECRET = os.getenv("ADGEM_BANNED_SECRET")
ADGEM_APP_ID = os.getenv("ADGEM_APP_ID")
FRONTEND_BASE_URL = os.getenv("FRONTEND_BASE_URL")

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")
ADMIN_PIN = os.getenv("ADMIN_PIN")
# =============================================================================
# DATABASE MODELS
# =============================================================================

env = Environment(loader=FileSystemLoader('template'))

Base = declarative_base()

class UserStatus(str, Enum):
  PENDING = "pending"
  APPROVED = "approved"
  SUSPENDED = "suspended"
  REJECTED = "rejected"

class RedemptionStatus(str, Enum):
  PENDING = "pending"
  APPROVED = "approved"
  REJECTED = "rejected"
  PROCESSED = "processed"

class RedemptionType(str, Enum):
  BITCOIN = "bitcoin"
  GIFT_CARD = "gift_card"

class User(Base):
  __tablename__ = "users"
  
  id = Column(Integer, primary_key=True, index=True)
  email = Column(String, unique=True, index=True, nullable=False)
  name = Column(String, nullable=False)
  password_hash = Column(String, nullable=False)
  pin_hash = Column(String, nullable=False)
  status = Column(String, default=UserStatus.PENDING)
  is_admin = Column(Boolean, default=False)
  is_agent = Column(Boolean, default=False)
  is_flagged = Column(Boolean, default=False) # Existing
  points_balance = Column(SQLDecimal(10, 2), default=0)
  referral_code = Column(String, unique=True, nullable=True)
  referred_by_code = Column(String, nullable=True)
  email_verified = Column(Boolean, default=False)
  birthday_day = Column(Integer, nullable=True)  # 1-31
  birthday_month = Column(Integer, nullable=True)  # 1-12
  birthday_year = Column(Integer, nullable=True)  # 4 digits
  gender = Column(String(1), nullable=True)  # 'm' or 'f'
  user_country_code = Column(String(2), nullable=True)  # Two letter country code
  zip_code = Column(String, nullable=True)  # Variable length per country
  created_at = Column(DateTime(timezone=True), server_default=func.now())
  updated_at = Column(DateTime(timezone=True), onupdate=func.now())
  
  # Relationships
  devices = relationship("UserDevice", back_populates="user")
  sent_transfers = relationship("PointTransfer", foreign_keys="PointTransfer.from_user_id", back_populates="from_user")
  received_transfers = relationship("PointTransfer", foreign_keys="PointTransfer.to_user_id", back_populates="to_user")
  redemptions = relationship("Redemption", back_populates="user", foreign_keys="Redemption.user_id")
  approvals = relationship("UserApproval", back_populates="user", foreign_keys="UserApproval.user_id")
  activity_logs = relationship("ActivityLog", back_populates="user", cascade="all, delete-orphan")
  user_surveys = relationship("UserSurvey", back_populates="user")
  pending_points = relationship("PendingPoint", back_populates="user", cascade="all, delete")

class UserDevice(Base):
  __tablename__ = "user_devices"
  
  id = Column(Integer, primary_key=True, index=True)
  user_id = Column(Integer, ForeignKey("users.id"))
  device_fingerprint = Column(String, nullable=False)
  ip_address = Column(String, nullable=False)
  user_agent = Column(Text)
  created_at = Column(DateTime(timezone=True), server_default=func.now())
  
  user = relationship("User", back_populates="devices")
  
  __table_args__ = (UniqueConstraint('user_id', 'device_fingerprint', name='unique_user_device'),)

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String, nullable=False)  # e.g., "USER_LOGIN", "SURVEY_COMPLETED"
    details = Column(Text)
    ip_address = Column(String)
    user_agent = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="activity_logs")

class FraudFlag(Base):
  __tablename__ = "fraud_flags"
  
  id = Column(Integer, primary_key=True, index=True)
  user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
  reason = Column(String, nullable=False)
  created_at = Column(DateTime(timezone=True), server_default=func.now())

  user = relationship("User", backref="fraud_flag")
  
class OTP(Base):
  __tablename__ = "otps"
  
  id = Column(Integer, primary_key=True, index=True)
  email = Column(String, nullable=False)
  otp_code = Column(String, nullable=False)
  purpose = Column(String, nullable=False) # signup, password_reset, pin_reset
  expires_at = Column(DateTime(timezone=True), nullable=False)
  used = Column(Boolean, default=False)
  created_at = Column(DateTime(timezone=True), server_default=func.now())

class PointTransfer(Base):
  __tablename__ = "point_transfers"
  
  id = Column(Integer, primary_key=True, index=True)
  from_user_id = Column(Integer, ForeignKey("users.id"))
  to_user_id = Column(Integer, ForeignKey("users.id"))
  amount = Column(SQLDecimal(10, 2), nullable=False)
  created_at = Column(DateTime(timezone=True), server_default=func.now())
  
  from_user = relationship("User", foreign_keys=[from_user_id], back_populates="sent_transfers")
  to_user = relationship("User", foreign_keys=[to_user_id], back_populates="received_transfers")

class UserSurvey(Base):
  __tablename__ = "user_surveys"
  
  id = Column(Integer, primary_key=True, index=True)
  user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
  survey_id = Column(Integer, ForeignKey("surveys.id"), nullable=False)
  points_earned = Column(SQLDecimal(10, 2), default=0)
  completed_at = Column(DateTime(timezone=True), server_default=func.now())
  is_validated_by_provider = Column(Boolean, default=False) # NEW
  is_rewarded = Column(Boolean, default=False) # NEW

  user = relationship("User", back_populates="user_surveys")
  survey = relationship("Survey")

class Survey(Base):
  __tablename__ = "surveys"
  
  id = Column(Integer, primary_key=True, index=True)
  title = Column(String, nullable=False)
  description = Column(Text)
  points_reward = Column(SQLDecimal(10, 2), nullable=False)
  provider_id = Column(String, nullable=True) # NEW: maps to survey provider's survey ID
  is_active = Column(Boolean, default=True)
  created_at = Column(DateTime(timezone=True), server_default=func.now())
  # ❌ No need to define user_surveys here
  
class Redemption(Base):
  __tablename__ = "redemptions"
  
  id = Column(Integer, primary_key=True, index=True)
  user_id = Column(Integer, ForeignKey("users.id"))
  type = Column(String, nullable=False) # bitcoin, gift_card
  points_amount = Column(SQLDecimal(10, 2), nullable=False)
  equivalent_value = Column(SQLDecimal(10, 8), nullable=False)
  wallet_address = Column(String, nullable=True) # For Bitcoin
  email_address = Column(String, nullable=True) # For Gift Cards
  status = Column(String, default=RedemptionStatus.PENDING)
  processed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
  created_at = Column(DateTime(timezone=True), server_default=func.now())
  processed_at = Column(DateTime(timezone=True), nullable=True)
  
  user = relationship("User", foreign_keys=[user_id], back_populates="redemptions")

class UserApproval(Base):
  __tablename__ = "user_approvals"
  
  id = Column(Integer, primary_key=True, index=True)
  user_id = Column(Integer, ForeignKey("users.id"))
  approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
  status = Column(String, nullable=False)
  approval_token = Column(String, unique=True, nullable=True) # For email approval
  created_at = Column(DateTime(timezone=True), server_default=func.now())
  
  user = relationship("User", foreign_keys=[user_id], back_populates="approvals")

class SystemSettings(Base):
  __tablename__ = "system_settings"
  
  id = Column(Integer, primary_key=True, index=True)
  key = Column(String, unique=True, nullable=False)
  value = Column(String, nullable=False)
  description = Column(Text)
  updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class FraudRule(Base):
  __tablename__ = "fraud_rules"
  
  id = Column(Integer, primary_key=True, index=True)
  rule_key = Column(String, unique=True, nullable=False)  
    # e.g. "max_devices_per_user", "max_users_per_fingerprint"
    
  limit_value = Column(Integer, nullable=False, default=1)  
    # e.g. 3, 5, etc.
    
  action = Column(String, nullable=False, default="block")  
    # actions: "allow", "flag", "block", "flag_and_block"
    
  description = Column(String, nullable=True)

class PendingPoint(Base):
    __tablename__ = "pending_points"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    source = Column(String, default="survey")  # e.g., survey, referral
    survey_id = Column(String, nullable=True)
    earned_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="pending")  # pending or released

    user = relationship("User", back_populates="pending_points")

class TransactionLog(Base):
    __tablename__ = "transaction_logs"

    id = Column(Integer, primary_key=True, index=True)
    tx_id = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class UserFingerprint(Base):
  __tablename__ = "user_fingerprints"
  
  id = Column(Integer, primary_key=True, index=True)
  user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
  fingerprint = Column(String, nullable=False)
  created_at = Column(DateTime, default=datetime.utcnow)

class UserSession(Base):
  __tablename__ = "user_sessions"
  
  id = Column(Integer, primary_key=True, index=True)
  user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
  session_token = Column(String, nullable=False)
  created_at = Column(DateTime, default=datetime.utcnow)

class UserActivity(Base):
  __tablename__ = "user_activities"
  
  id = Column(Integer, primary_key=True, index=True)
  user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
  activity_type = Column(String, nullable=False)
  activity_details = Column(String)
  created_at = Column(DateTime, default=datetime.utcnow)

class UserReferral(Base):
  __tablename__ = "user_referrals"
  
  id = Column(Integer, primary_key=True, index=True)
  referrer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
  referred_id = Column(Integer, ForeignKey("users.id"), nullable=False)
  created_at = Column(DateTime, default=datetime.utcnow)

class UserTransaction(Base):
    __tablename__ = "user_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    transaction_type = Column(String, nullable=False)
    transaction_amount = Column(Float, nullable=False)
    transaction_date = Column(DateTime, default=datetime.utcnow)

class UserWithdrawal(Base):
    __tablename__ = "user_withdrawals"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    withdrawal_amount = Column(Float, nullable=False)
    withdrawal_date = Column(DateTime, default=datetime.utcnow)
    withdrawal_status = Column(String, nullable=False)

class UserNotification(Base):
    __tablename__ = "user_notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    notification_type = Column(String, nullable=False)
    notification_message = Column(String, nullable=False)
    notification_date = Column(DateTime, default=datetime.utcnow)
# =============================================================================
# PYDANTIC SCHEMAS
# =============================================================================

# User Schemas
class UserBase(BaseModel):
  email: EmailStr
  name: str

class UserCreate(UserBase):
  password: str
  pin: str
  referral_code: Optional[str] = None
  device_fingerprint: str
  ip_address: str
  user_agent: Optional[str] = None
  birthday_day: Optional[int] = None
  birthday_month: Optional[int] = None
  birthday_year: Optional[int] = None
  gender: Optional[str] = None  # 'm' or 'f'
  user_country_code: Optional[str] = None
  zip_code: Optional[str] = None

class ExternalSurvey(BaseModel):
    survey_id: str
    title: str
    description: Optional[str]
    points_reward: float
    redirect_url: str

# Password Schemas
class PasswordChangeRequest(BaseModel):
  current_password: str
  new_password: str

class FraudRuleUpdate(BaseModel):
    rule_key: str
    limit_value: int
    action: str  # "allow", "flag", "block", "flag_and_block"
    description: Optional[str] = None

# NEW: Schema for updating fraud rules (only includes fields that can be patched)
class FraudRulePatch(BaseModel):
    limit_value: int
    action: str  # "allow", "flag", "block", "flag_and_block"

class AdminPointTransferRequest(BaseModel):
    from_user_email: Optional[EmailStr] = None  # Optional for admin crediting system
    to_user_email: EmailStr
    points_amount: int

    @validator("points_amount")
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError("Amount must be greater than 0")
        return v

# PIN Schemas
class PinChangeRequest(BaseModel):
  current_pin: str
  new_pin: str

class PasswordResetRequest(BaseModel):
    email: str
    otp_code: str
    new_password: str

class PinResetRequest(BaseModel):
    email: str
    otp_code: str
    new_pin: str

class UserLogin(BaseModel):
    email: str
    password: str
    device_fingerprint: str = None
    ip_address: str = None
    user_agent: str = None

class BasicUserInfo(BaseModel):
  id: int
  email: str
  name: str

  class Config:
      from_attributes = True

class FraudFlagResponse(BaseModel):
    user: BasicUserInfo
    reason: str
    created_at: datetime

    class Config:
        orm_mode = True

class UserPinVerify(BaseModel):
  pin: str

class UserResponse(UserBase):
    id: int
    name: str
    status: UserStatus
    is_admin: bool
    is_agent: bool
    is_flagged: bool # Added to UserResponse
    points_balance: Decimal
    pending_points_balance: Optional[Decimal] = None  # ✅ Add this line
    referral_code: Optional[str]
    email_verified: bool
    birthday_day: Optional[int] = None
    birthday_month: Optional[int] = None
    birthday_year: Optional[int] = None
    gender: Optional[str] = None
    user_country_code: Optional[str] = None
    zip_code: Optional[str] = None
    created_at: datetime
    referred_users_count: Optional[int] = None  # Already present

    class Config:
        from_attributes = True

# OTP Schemas
class OTPRequest(BaseModel):
  email: EmailStr
  purpose: str # signup, password_reset, pin_reset

class OTPVerify(BaseModel):
  email: EmailStr
  otp_code: str
  purpose: str

# Point Transfer Schemas
class PointTransferCreate(BaseModel):
  to_email: EmailStr
  amount: Decimal
  
  @validator('amount')
  def amount_must_be_positive(cls, v):
      if v <= 0:
          raise ValueError('Amount must be positive')
      return v

class PointTransferResponse(BaseModel):
  id: int
  amount: Decimal
  created_at: datetime
  from_user: BasicUserInfo
  to_user: BasicUserInfo

  class Config:
      from_attributes = True

class PendingPointCreate(BaseModel):
    user_id: int
    amount: float
    source: str = "survey"

# Redemption Schemas
class RedemptionCreate(BaseModel):
  type: RedemptionType
  points_amount: Decimal
  wallet_address: Optional[str] = None
  email_address: Optional[EmailStr] = None
  
  @validator('wallet_address')
  def validate_bitcoin_address(cls, v, values):
      if values.get('type') == RedemptionType.BITCOIN and not v:
          raise ValueError('Wallet address required for Bitcoin redemption')
      return v
  
  @validator('email_address')
  def validate_gift_card_email(cls, v, values):
      if values.get('type') == RedemptionType.GIFT_CARD and not v:
          raise ValueError('Email address required for Gift Card redemption')
      return v

class AdminRedemptionResponse(BaseModel):
    id: int
    type: RedemptionType
    points_amount: Decimal
    equivalent_value: Decimal
    status: RedemptionStatus
    created_at: datetime
    user_id: int
    user_email: str
    destination: str

    class Config:
        from_attributes = True

class RedemptionResponse(BaseModel):
    id: int
    type: RedemptionType
    points_amount: Decimal
    equivalent_value: Decimal  # already dynamic
    status: RedemptionStatus
    created_at: datetime

    class Config:
        from_attributes = True
        
# Admin Schemas
class UserStatusUpdate(BaseModel):
  status: UserStatus

class AgentAssignment(BaseModel):
  user_id: int
  is_agent: bool

class SystemSettingUpdate(BaseModel):
  key: str
  value: str
  description: Optional[str] = None

class BulkUserStatusUpdate(BaseModel): # NEW
    user_ids: List[int]
    status: UserStatus

# Survey Schemas
class SurveyCreate(BaseModel):
  title: str
  description: Optional[str] = None
  points_reward: Decimal

class SurveyResponse(BaseModel):
  id: int
  title: str
  description: Optional[str]
  points_reward: Decimal
  is_active: bool
  created_at: datetime
  
  class Config:
      from_attributes = True

# Dashboard Schemas

class DashboardStats(BaseModel):
    points_balance: Decimal
    pending_points_balance: Decimal  # ✅ Add this
    completed_surveys: int
    total_earned: Decimal
    pending_redemptions: int
    is_flagged: bool

class AdminDashboardStats(BaseModel): # NEW
    total_users: int
    total_surveys_completed: int
    total_points_distributed: Decimal
    pending_redemptions: int
    reward_percentage: Optional[str] = None

class TransferHistory(BaseModel):
  transfers: List[PointTransferResponse]
  total_sent: Decimal
  total_received: Decimal

# =============================================================================
# DATABASE SETUP
# =============================================================================

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_tables():
  Base.metadata.create_all(bind=engine)

def get_db():
  db = SessionLocal()
  try:
      yield db
  finally:
      db.close()

# =============================================================================
# AUTHENTICATION UTILITIES
# =============================================================================

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def verify_password(plain_password, hashed_password):
  return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
  return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
  to_encode = data.copy()
  if expires_delta:
      expire = datetime.utcnow() + expires_delta
  else:
      expire = datetime.utcnow() + timedelta(minutes=15)
  to_encode.update({"exp": expire})
  encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
  return encoded_jwt

def verify_token(token: str):
  try:
      payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
      email: str = payload.get("sub")
      if email is None:
          raise HTTPException(
              status_code=status.HTTP_401_UNAUTHORIZED,
              detail="Could not validate credentials"
          )
      return email
  except JWTError:
      raise HTTPException(
          status_code=status.HTTP_401_UNAUTHORIZED,
          detail="Could not validate credentials"
      )


def track_user_device(user: User, db: Session, device_fingerprint: str, ip_address: str, user_agent: str):
    """
    Track the device and enforce fraud prevention limits
    based on FraudRule table settings.
    """
    if user.is_admin:
        return  # Skip checks for admins

    # Load all fraud rules into a dictionary
    rules = {r.rule_key: r for r in db.query(FraudRule).all()}

    def apply_action(rule_key, message):
        """Apply the action for the violated rule. Returns True if block action."""
        action = rules[rule_key].action.lower()
        
        # Flag if needed
        if action in ["flag", "flag_and_block"]:
            if not db.query(FraudFlag).filter(FraudFlag.user_id == user.id).first():
                db.add(FraudFlag(user_id=user.id, reason=message))
                user.is_flagged = True # Set user's is_flagged status
                db.add(user)
                db.commit() # Commit flag and user status change immediately

        # Block if needed
        if action in ["block", "flag_and_block"]:
            user.status = UserStatus.SUSPENDED # Set user status to suspended
            db.add(user)
            db.commit() # Commit user status change immediately
            raise HTTPException(status_code=403, detail=message) # Block the request

    # --- Rule 1: Max users per fingerprint ---
    if "max_users_per_fingerprint" in rules:
        max_users_per_fingerprint = rules["max_users_per_fingerprint"].limit_value
        # Count distinct users associated with this fingerprint
        users_for_this_fp = db.query(UserDevice.user_id).filter(
            UserDevice.device_fingerprint == device_fingerprint
        ).distinct().count()

        # Check if the current user is already associated with this fingerprint
        is_user_already_associated = db.query(exists().where(
            and_(UserDevice.user_id == user.id, UserDevice.device_fingerprint == device_fingerprint)
        )).scalar()

        if not is_user_already_associated and users_for_this_fp >= max_users_per_fingerprint:
            apply_action("max_users_per_fingerprint", f"Maximum users per device ({max_users_per_fingerprint}) exceeded for fingerprint.")

    # --- Rule 2: Max devices per user ---
    if "max_devices_per_user" in rules:
        max_devices_per_user = rules["max_devices_per_user"].limit_value
        # Count distinct device fingerprints for this user
        user_devices_count = db.query(UserDevice.device_fingerprint).filter(
            UserDevice.user_id == user.id
        ).distinct().count()

        # Check if the current device fingerprint is already associated with the user
        is_device_already_associated = db.query(exists().where(
            and_(UserDevice.user_id == user.id, UserDevice.device_fingerprint == device_fingerprint)
        )).scalar()

        if not is_device_already_associated and user_devices_count >= max_devices_per_user:
            apply_action("max_devices_per_user", f"Maximum devices per user ({max_devices_per_user}) exceeded.")

    # --- Rule 3: Max IPs per user in 24 hours ---
    if "max_ips_per_user_24h" in rules:
        max_ips_per_user_24h = rules["max_ips_per_user_24h"].limit_value
        since_24h = datetime.utcnow() - timedelta(hours=24)
        
        # Count distinct IPs for this user in the last 24 hours
        unique_ips_last_24h_count = db.query(UserDevice.ip_address).filter(
            UserDevice.user_id == user.id,
            UserDevice.created_at >= since_24h
        ).distinct().count()

        # Check if the current IP address is already recorded for the user in the last 24h
        is_ip_already_recorded = db.query(exists().where(
            and_(UserDevice.user_id == user.id, UserDevice.ip_address == ip_address, UserDevice.created_at >= since_24h)
        )).scalar()

        if not is_ip_already_recorded and unique_ips_last_24h_count >= max_ips_per_user_24h:
            apply_action("max_ips_per_user_24h", f"Maximum unique IPs per user in 24h ({max_ips_per_user_24h}) exceeded.")

    # --- Save device if new ---
    already_saved = db.query(UserDevice).filter(
        UserDevice.user_id == user.id,
        UserDevice.device_fingerprint == device_fingerprint
    ).first()

    if not already_saved:
        db.add(UserDevice(
            user_id=user.id,
            device_fingerprint=device_fingerprint,
            ip_address=ip_address,
            user_agent=user_agent
        ))
        db.commit()
      
def generate_otp():
  return ''.join(secrets.choice(string.digits) for _ in range(6))

def generate_referral_code():
  return ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))

def generate_approval_token():
  return secrets.token_urlsafe(32)

# =============================================================================
# EMAIL SERVICE
# =============================================================================

class EmailService:
  def __init__(self):
      self.smtp_server = SMTP_SERVER
      self.smtp_port = SMTP_PORT
      self.smtp_username = SMTP_USERNAME
      self.smtp_password = SMTP_PASSWORD
      self.from_email = FROM_EMAIL
      self.from_name = FROM_NAME

  def send_email(self, to_email: str, subject: str, body: str, is_html: bool = False):
    try:
        msg = MIMEMultipart()
        msg['From'] = formataddr((self.from_name, self.from_email))  # Show name + email
        msg['To'] = to_email
        msg['Subject'] = subject

        msg.attach(MIMEText(body, 'html' if is_html else 'plain'))

        # Use SSL/TLS connection for PrivateMail (port 465)
        with smtplib.SMTP_SSL(self.smtp_server, self.smtp_port) as server:
            server.login(self.smtp_username, self.smtp_password)
            server.sendmail(self.from_email, to_email, msg.as_string())

        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

  def send_otp_email(self, to_email: str, otp_code: str, purpose: str):
    subject = f"Your OTP Code for {purpose.replace('_', ' ').title()}"
    template = env.get_template('otp_email_template.html')
    body = template.render(otp_code=otp_code, purpose=purpose)  # pass purpose here
    return self.send_email(to_email, subject, body, is_html=True)

  def send_agent_approval_email(self, agent_email: str, user_name: str, user_email: str, approval_token: str):
    approve_url = f"{BASE_URL}/api/agent/approve/{approval_token}?action=approve"
    reject_url = f"{BASE_URL}/api/agent/approve/{approval_token}?action=reject"

    subject = "New User Approval Request"
    template = env.get_template('agent_approval_email.html')
    body = template.render(
        user_name=user_name,
        user_email=user_email,
        approve_url=approve_url,
        reject_url=reject_url
    )
    return self.send_email(agent_email, subject, body, is_html=True)

email_service = EmailService()

# FASTAPI APPLICATION SETUP
# =============================================================================

app = FastAPI(
    title="Survecta API",
    description="Survecta API Backend",
    version="1.0.0",
    docs_url=None,       # Disable Swagger UI (/docs)
    redoc_url=None,      # Disable ReDoc (/redoc)
    openapi_url=None     # Disable OpenAPI schema (/openapi.json)
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://survecta.com",
        "https://api.survecta.com",
        "https://isuwa.netlify.app",
        "https://dansog-backend.onrender.com",
        "https://survecta.netlify.app"  # If you still host frontend here
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],  # Includes HEAD for uptime checks
    allow_headers=["*"],
)

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

def create_default_data(db):
    """
    Ensure only one valid admin from environment exists, and set default system settings (without overriding).
    """
    admin_email = os.getenv("ADMIN_EMAIL")
    admin_password = os.getenv("ADMIN_PASSWORD")
    admin_pin = os.getenv("ADMIN_PIN")

    if not all([admin_email, admin_password, admin_pin]):
        raise RuntimeError("Missing ADMIN_EMAIL, ADMIN_PASSWORD, or ADMIN_PIN in environment")

    # Step 1: Remove all other admin users except the one defined in the environment
    existing_admins = db.query(User).filter(User.is_admin == True).all()
    for user in existing_admins:
        if user.email != admin_email:
            db.delete(user)

    # Step 2: Create or update the admin user
    admin = db.query(User).filter(User.email == admin_email).first()
    if not admin:
        admin = User(
            email=admin_email,
            name="System Admin",
            password_hash=get_password_hash(admin_password),
            pin_hash=get_password_hash(admin_pin),
            status=UserStatus.APPROVED,
            is_admin=True,
            email_verified=True
        )
        db.add(admin)
    else:
        # Always update admin credentials from environment
        admin.password_hash = get_password_hash(admin_password)
        admin.pin_hash = get_password_hash(admin_pin)

    # Step 3: Only create system settings if they don't exist (do NOT override existing ones)
    default_settings = [
        ("point_to_btc_rate", "10000:0.00001", "Points to Bitcoin conversion rate (points:BTC)"),
        ("point_to_gift_rate", "100:1", "Points to Gift Card conversion rate (points:USD)"),
        ("survey_default_points", "100", "Default points for completing surveys"),
        ("max_devices_per_user", "3", "Maximum devices allowed per user"),
        ("auto_user_approval", "false", "Automatically approve new user registrations"),
        ("system_reward_percentage", "85", "Percentage of points rewarded from surveys")
    ]

    for key, value, description in default_settings:
        existing_setting = db.query(SystemSettings).filter_by(key=key).first()
        if not existing_setting:
            setting = SystemSettings(key=key, value=value, description=description)
            db.add(setting)

    db.commit()
    

def verify_hash(payload_bytes: bytes, signature: str) -> bool:
    """
    Verify BitLabs callback hash using HMAC-SHA1.
    """
    if not APP_SECRET:
        return False
    expected = hmac.new(APP_SECRET.encode(), payload_bytes, hashlib.sha1).hexdigest()
    return hmac.compare_digest(expected, signature)


def verify_adgem_signature(params: dict, received_verifier: str) -> bool:
    """
    Verify AdGem callback using HMAC-SHA256 with your POSTBACK KEY.
    AdGem expects you to:
      1. Remove the `verifier` field.
      2. Sort all params alphabetically.
      3. Build the query string.
      4. Hash it with your postback key.
    """
    if not ADGEM_POSTBACK_KEY:
        return False

    params_no_veri = params.copy()
    params_no_veri.pop("verifier", None)

    # Sort params
    sorted_query = "&".join(f"{k}={params_no_veri[k]}" for k in sorted(params_no_veri))

    computed_hash = hmac.new(
        ADGEM_POSTBACK_KEY.encode("utf-8"),
        sorted_query.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(computed_hash, received_verifier)


def verify_adgem_webhook_signature(body: bytes, received_sig: str) -> bool:
    if not ADGEM_BANNED_SECRET:
        return False

    computed = hmac.new(
        ADGEM_BANNED_SECRET.encode("utf-8"),
        body,
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(computed, received_sig)



def verify_cpx_research_hash(params: dict, received_hash: str) -> bool:
    """
    Verify CPX Research webhook hash.
    Hash is typically MD5 or SHA256 of concatenated parameters + secret
    """
    if not CPX_RESEARCH_HASH or not received_hash:
        return False
    
    # Create hash string from parameters (excluding the hash itself)
    hash_params = []
    for key in sorted(params.keys()):
        if key != 'hash':  # Exclude hash from hash calculation
            hash_params.append(f"{key}={params[key]}")
    
    hash_string = "&".join(hash_params) + CPX_RESEARCH_HASH
    expected_hash = hashlib.md5(hash_string.encode()).hexdigest()
    
    return hmac.compare_digest(expected_hash.lower(), received_hash.lower())


def calculate_reward_points(payload: dict, base_dollar_rate: Decimal) -> Decimal:
    """
    Convert provider points (BitLabs, profiles, etc.) to system points using the system base dollar.

    Args:
        payload: dict from webhook (expected keys: VAL/amount, RAW, USD/dollar_amount)
        base_dollar_rate: Decimal - system points per 1 USD

    Returns:
        Decimal: points to credit to user
    """
    try:
        # --- Extract values ---
        provider_points = Decimal(str(payload.get("VAL") or payload.get("amount") or "0"))
        provider_raw = Decimal(str(payload.get("RAW") or "60"))  # default 60 points = $1
        base_rate = Decimal(str(base_dollar_rate))

        if provider_points <= 0:
            return Decimal("0")

        # --- Convert provider points to USD ---
        usd_equivalent = provider_points / provider_raw

        # --- Convert USD to system points using base dollar ---
        system_points = usd_equivalent * base_rate

        return system_points.quantize(Decimal("0.01"))

    except Exception:
        return Decimal("0")


def log_activity(
    db: Session,
    user_id: Optional[int],
    action: str,
    details: Optional[str] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    description: Optional[str] = None,  # legacy support
    message: Optional[str] = None
):
    """Log user activity (supports both description and legacy details)"""
    log = ActivityLog(
        user_id=user_id,
        action=action,
        details=details or description or message,
        ip_address=ip_address,
        user_agent=user_agent
    )
    db.add(log)
    db.commit()

def _update_or_create_setting(db: Session, key: str, value: str):
    setting = db.query(SystemSettings).filter(SystemSettings.key == key).first()
    if setting:
        setting.value = value
    else:
        setting = SystemSettings(key=key, value=value)
        db.add(setting)

def init_fraud_rules(db: Session):
    default_rules = [
        {
            "rule_key": "max_devices_per_user",
            "limit_value": 3,
            "action": "block",
            "description": "Maximum devices allowed per user"
        },
        {
            "rule_key": "max_users_per_fingerprint",
            "limit_value": 3,
            "action": "block",
            "description": "Maximum users per device fingerprint"
        },
        {
            "rule_key": "max_ips_per_user_24h",
            "limit_value": 5,
            "action": "block",
            "description": "Maximum unique IPs per user in 24 hours"
        },
        {
            "rule_key": "max_signups_per_fingerprint_24h",
            "limit_value": 3,
            "action": "block",
            "description": "Maximum signups per device fingerprint in 24 hours"
        },
    ]

    for rule in default_rules:
        existing = db.query(FraudRule).filter(FraudRule.rule_key == rule["rule_key"]).first()
        if not existing:
            db.add(FraudRule(**rule))
    db.commit()


def apply_fraud_action_background(db: Session, rules: dict, rule_key: str, user: User, message: str):
    """
    Applies the fraud rule action for the given rule_key in background tasks.
    This function does not raise HTTPExceptions, but updates user status and flags.
    """
    if rule_key not in rules:
        return

    action = rules[rule_key].action.lower()

    # Flag if needed
    if action in ["flag", "flag_and_block"]:
        if not db.query(FraudFlag).filter(FraudFlag.user_id == user.id).first():
            db.add(FraudFlag(user_id=user.id, reason=message))
            user.is_flagged = True
            db.add(user) # Add user to session to update is_flagged
            db.commit() # Commit flag and user status change immediately

    # Block if needed (set user status to suspended)
    if action in ["block", "flag_and_block"]:
        if user.status != UserStatus.SUSPENDED: # Only change if not already suspended
            user.status = UserStatus.SUSPENDED
            db.add(user)
            db.commit() # Commit user status change immediately


def get_system_setting(db: Session, key: str, default: str = "0"):
  """Get system setting value"""
  setting = db.query(SystemSettings).filter(SystemSettings.key == key).first()
  return setting.value if setting else default

# =============================================================================
# DEPENDENCY FUNCTIONS
# =============================================================================

def get_current_user(token: str = Depends(security), db: Session = Depends(get_db)):
  """Get current authenticated user"""
  # print("DEBUG: Received token:", token.credentials) # 🔥 REMOVED

  email = verify_token(token.credentials)
  user = db.query(User).filter(User.email == email).first()
  if not user:
      raise HTTPException(status_code=404, detail="User not found")
  return user

def get_admin_user(current_user: User = Depends(get_current_user)):
  """Ensure current user is admin"""
  if not current_user.is_admin:
      raise HTTPException(status_code=403, detail="Admin access required")
  return current_user

def get_agent_user(current_user: User = Depends(get_current_user)):
  """Ensure current user is agent or admin"""
  if not (current_user.is_agent or current_user.is_admin):
      raise HTTPException(status_code=403, detail="Agent access required")
  return current_user

# =============================================================================
# STARTUP EVENT
# =============================================================================

@app.on_event("startup")
def startup_event():
    create_tables()
    db = next(get_db())
    create_default_data(db)
    init_fraud_rules(db) # Initialize fraud rules on startup

    print("🚀 Survecta API Started Successfully!")
    print("✅ Admin account initialized securely from environment variables.")
    print(f"🌐 API Documentation: {BASE_URL}/docs")

# =============================================================================
# AUTHENTICATION ENDPOINTS
# =============================================================================

@app.post("/api/auth/request-otp")
def request_otp(otp_request: OTPRequest, db: Session = Depends(get_db)):
    email_normalized = otp_request.email.strip().lower()

    # Delete old OTPs for this normalized email and purpose
    db.query(OTP).filter(
        and_(func.lower(OTP.email) == email_normalized, OTP.purpose == otp_request.purpose)
    ).delete()

    otp_code = generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=10)

    otp = OTP(
        email=email_normalized,
        otp_code=otp_code,
        purpose=otp_request.purpose,
        expires_at=expires_at
    )
    db.add(otp)
    db.commit()

    # Send OTP email with normalized email
    email_service.send_otp_email(email_normalized, otp_code, otp_request.purpose)

    return {"message": "OTP sent successfully"}

@app.post("/api/auth/verify-otp")
def verify_otp(otp_verify: OTPVerify, request: Request, db: Session = Depends(get_db)): # Added request: Request
  """Verify OTP code"""
  utc = pytz.utc # Define utc timezone
  otp = db.query(OTP).filter(
      and_(
          OTP.email == otp_verify.email,
          OTP.otp_code == otp_verify.otp_code,
          OTP.purpose == otp_verify.purpose,
          OTP.used.is_(False),
          OTP.expires_at > utc.localize(datetime.utcnow()) # Localize current UTC time
      )
  ).first()
  
  if not otp:
      raise HTTPException(status_code=400, detail="Invalid or expired OTP")
  
  otp.used = True
  db.commit()
  log_activity(db, None, "OTP_VERIFIED", f"OTP for {otp_verify.email} ({otp_verify.purpose}) verified successfully", request.client.host) # Added log
  
  return {"message": "OTP verified successfully"}

@app.post("/api/users/change-password")
def change_password(
  request_body: PasswordChangeRequest,
  request: Request, # Added Request dependency
  db: Session = Depends(get_db),
  current_user: User = Depends(get_current_user)
):
  if not pwd_context.verify(request_body.current_password, current_user.password_hash):
      raise HTTPException(status_code=400, detail="Incorrect current password")

  current_user.password_hash = pwd_context.hash(request_body.new_password)
  db.commit()
  log_activity(db, current_user.id, "PASSWORD_CHANGE", "User changed password", request.client.host) # Added log

  return {"message": "Password changed successfully"}

@app.post("/api/auth/reset-password")
def reset_password(
    body: PasswordResetRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    email_normalized = body.email.strip().lower()
    user = db.query(User).filter(func.lower(User.email) == email_normalized).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    otp_record = db.query(OTP).filter_by(
        email=body.email,
        purpose="password_reset",
        otp_code=body.otp_code
    ).first()

    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    user.password_hash = pwd_context.hash(body.new_password)
    db.commit()

    ip_address = getattr(request.client, "host", "unknown")
    log_activity(db, user.id, "PASSWORD_RESET", "User reset password via OTP", ip_address)

    db.delete(otp_record)
    db.commit()

    return {"message": "Password reset successfully"}
    
@app.post("/api/users/change-pin")
def change_pin(
  request_body: PinChangeRequest,
  request: Request, # Added Request dependency
  db: Session = Depends(get_db),
  current_user: User = Depends(get_current_user)
):
  if not pwd_context.verify(request_body.current_pin, current_user.pin_hash):
      raise HTTPException(status_code=400, detail="Incorrect current PIN")

  current_user.pin_hash = pwd_context.hash(request_body.new_pin)
  db.commit()
  log_activity(db, current_user.id, "PIN_CHANGE", "User changed PIN", request.client.host) # Added log

  return {"message": "PIN changed successfully"}

@app.post("/api/auth/reset-pin")
def reset_pin(
    body: PinResetRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    email_normalized = body.email.strip().lower()
    user = db.query(User).filter(func.lower(User.email) == email_normalized).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    otp_record = db.query(OTP).filter_by(
        email=body.email,
        purpose="pin_reset",
        otp_code=body.otp_code
    ).first()

    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    user.pin_hash = pwd_context.hash(body.new_pin)
    db.commit()

    ip_address = getattr(request.client, "host", "unknown")
    log_activity(db, user.id, "PIN_RESET", "User reset PIN via OTP", ip_address)

    db.delete(otp_record)
    db.commit()

    return {"message": "PIN reset successfully"}


@app.post("/api/auth/signup")
def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    """User registration with fraud protection checks based on FraudRule actions."""

    # Check if email already exists
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Verify OTP
    utc = pytz.utc
    otp = db.query(OTP).filter(
        OTP.email == user_data.email,
        OTP.purpose == "signup",
        OTP.used.is_(True)
    ).order_by(OTP.created_at.desc()).first()

    if not otp or otp.created_at < utc.localize(datetime.utcnow()) - timedelta(minutes=15):
        raise HTTPException(status_code=400, detail="Please verify your email with OTP first")

    referring_agent = None
    if user_data.referral_code:
        referring_agent = db.query(User).filter(
            User.referral_code == user_data.referral_code,
            User.is_agent.is_(True)
        ).first()
        if not referring_agent:
            raise HTTPException(status_code=400, detail="Invalid referral code")

    auto_approve_setting = get_system_setting(db, "auto_user_approval", "false")
    initial_status = UserStatus.APPROVED if auto_approve_setting.lower() == "true" else UserStatus.PENDING # Corrected to "true"

    device_fingerprint = user_data.device_fingerprint
    ip_address = user_data.ip_address or "unknown"
    if not device_fingerprint:
        raise HTTPException(status_code=400, detail="Missing device fingerprint.")

    # Load fraud rules
    rules = {r.rule_key: r for r in db.query(FraudRule).all()}

    def apply_action_signup(rule_key, message):
        """Applies the action for the violated rule during signup. Returns True if block action."""
        action = rules[rule_key].action.lower()
        
        # Flag if needed (cannot set user.is_flagged yet as user is not created)
        if action in ["flag", "flag_and_block"]:
            # We will add the flag after user creation if the user is not blocked
            pass 

        # Block if needed
        if action in ["block", "flag_and_block"]:
            raise HTTPException(status_code=403, detail=message) # Block the signup
        return False # Allow signup to proceed

    # --- Fraud check BEFORE user creation: Max signups per fingerprint (24h) ---
    if "max_signups_per_fingerprint_24h" in rules:
        limit = rules["max_signups_per_fingerprint_24h"].limit_value
        since_24h = datetime.utcnow() - timedelta(hours=24)
        
        # Count distinct users who signed up with this fingerprint in the last 24 hours
        recent_signups_count = db.query(UserDevice.user_id).filter(
            UserDevice.device_fingerprint == device_fingerprint,
            UserDevice.created_at >= since_24h
        ).distinct().count()

        if recent_signups_count >= limit:
            apply_action_signup("max_signups_per_fingerprint_24h", f"Maximum signups per device fingerprint in 24h ({limit}) exceeded.")

    user = User(
        email=user_data.email,
        name=user_data.name,
        password_hash=get_password_hash(user_data.password),
        pin_hash=get_password_hash(user_data.pin),
        referred_by_code=user_data.referral_code,
        email_verified=True,
        status=initial_status,
        birthday_day=user_data.birthday_day,
        birthday_month=user_data.birthday_month,
        birthday_year=user_data.birthday_year,
        gender=user_data.gender,
        user_country_code=user_data.user_country_code,
        zip_code=user_data.zip_code
    )
    db.add(user)
    db.flush() # Flush to get user.id

    # Track device and apply other fraud rules (max devices per user, max IPs per user)
    # This function will also set user.is_flagged and user.status if rules are violated
    track_user_device(
        user=user,
        db=db,
        device_fingerprint=device_fingerprint,
        ip_address=ip_address,
        user_agent=user_data.user_agent or "unknown"
    )

    # Approval handling
    if initial_status == UserStatus.PENDING:
        approval_token = generate_approval_token()
        approval = UserApproval(
            user_id=user.id,
            status=UserStatus.PENDING,
            approval_token=approval_token
        )
        db.add(approval)

        if referring_agent:
            email_service.send_agent_approval_email(
                referring_agent.email,
                user.name,
                user.email,
                approval_token
            )

    db.commit()

    # Log signup
    log_activity(
        db, user.id, "USER_SIGNUP",
        f"User signed up with referral: {user_data.referral_code}, status: {initial_status}",
        ip_address
    )

    return {
        "message": "Registration successful. Awaiting approval."
        if initial_status == UserStatus.PENDING
        else "Registration successful. Account approved."
    }

@app.post("/api/auth/login")
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """User login with fraud protection checks based on FraudRule actions."""
    email_normalized = user_data.email.strip().lower()
    user = db.query(User).filter(func.lower(User.email) == email_normalized).first()

    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if user.status != UserStatus.APPROVED:
        raise HTTPException(status_code=400, detail=f"Account is {user.status}")

    device_fingerprint = user_data.device_fingerprint
    ip_address = user_data.ip_address or "unknown"

    if not device_fingerprint:
        raise HTTPException(status_code=400, detail="Missing device fingerprint.")

    # Load fraud rules from DB
    rules = {r.rule_key: r for r in db.query(FraudRule).all()}

    def apply_action_login(rule_key, message):
        """Applies the action for the violated rule during login. Returns True if block action."""
        action = rules[rule_key].action.lower()

        # Flag if needed
        if action in ["flag", "flag_and_block"]:
            if not db.query(FraudFlag).filter(FraudFlag.user_id == user.id).first():
                db.add(FraudFlag(user_id=user.id, reason=message))
                user.is_flagged = True # Set user's is_flagged status
                db.add(user)
                db.commit() # Commit flag and user status change immediately

        # Block if needed
        if action in ["block", "flag_and_block"]:
            user.status = UserStatus.SUSPENDED # Set user status to suspended
            db.add(user)
            db.commit() # Commit user status change immediately
            raise HTTPException(status_code=403, detail=message) # Block the login

    # Fraud protection only for non-admins
    if not user.is_admin:
        # --- Rule 1: Max users per fingerprint ---
        if "max_users_per_fingerprint" in rules:
            limit = rules["max_users_per_fingerprint"].limit_value
            # Count distinct users associated with this fingerprint
            users_for_this_fp = db.query(UserDevice.user_id).filter(
                UserDevice.device_fingerprint == device_fingerprint
            ).distinct().count()

            # Check if the current user is already associated with this fingerprint
            is_user_already_associated = db.query(exists().where(
                and_(UserDevice.user_id == user.id, UserDevice.device_fingerprint == device_fingerprint)
            )).scalar()

            if not is_user_already_associated and users_for_this_fp >= limit:
                apply_action_login("max_users_per_fingerprint", f"Maximum users per device ({limit}) exceeded for fingerprint.")

        # --- Rule 2: Max devices per user ---
        if "max_devices_per_user" in rules:
            limit = rules["max_devices_per_user"].limit_value
            # Count distinct device fingerprints for this user
            user_devices_count = db.query(UserDevice.device_fingerprint).filter(
                UserDevice.user_id == user.id
            ).distinct().count()

            # Check if the current device fingerprint is already associated with the user
            is_device_already_associated = db.query(exists().where(
                and_(UserDevice.user_id == user.id, UserDevice.device_fingerprint == device_fingerprint)
            )).scalar()

            if not is_device_already_associated and user_devices_count >= limit:
                apply_action_login("max_devices_per_user", f"Maximum devices per user ({limit}) exceeded.")

    # Track device after checks
    track_user_device(
        user=user,
        db=db,
        device_fingerprint=device_fingerprint,
        ip_address=ip_address,
        user_agent=user_data.user_agent or "unknown"
    )

    # Generate token
    access_token = create_access_token(data={"sub": user.email})

    # Log login
    log_activity(db, user.id, "USER_LOGIN", "User logged in", ip_address)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.from_orm(user)
    }

@app.post("/api/auth/verify-pin")
def verify_pin(pin_data: UserPinVerify, request: Request, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)): # Added request: Request
  """Verify user's 4-digit PIN for dashboard access"""
  if not verify_password(pin_data.pin, current_user.pin_hash):
      raise HTTPException(status_code=400, detail="Invalid PIN")
  
  log_activity(db, current_user.id, "PIN_VERIFIED", "User successfully verified PIN for dashboard access", request.client.host) # Added log
  return {"message": "PIN verified successfully"}

# =============================================================================
# USER DASHBOARD ENDPOINTS
# =============================================================================

@app.get("/api/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get user dashboard statistics"""
    completed_surveys = db.query(UserSurvey).filter(UserSurvey.user_id == current_user.id).count()
    
    total_earned = db.query(func.sum(UserSurvey.points_earned)).filter(
        UserSurvey.user_id == current_user.id
    ).scalar() or Decimal(0)

    pending_redemptions = db.query(Redemption).filter(
        Redemption.user_id == current_user.id,
        Redemption.status == RedemptionStatus.PENDING
    ).count()

    # ✅ Calculate pending points
    pending_points = db.query(func.coalesce(func.sum(PendingPoint.amount), 0)).filter(
        PendingPoint.user_id == current_user.id,
        PendingPoint.status == "pending"
    ).scalar()

    return DashboardStats(
        points_balance=current_user.points_balance,
        pending_points_balance=pending_points or Decimal(0),  # ✅ Return the pending points
        completed_surveys=completed_surveys,
        total_earned=total_earned,
        pending_redemptions=pending_redemptions,
        is_flagged=current_user.is_flagged
)

@app.get("/api/users/me", response_model=UserResponse)
def get_current_user_profile(
  request: Request, # Added Request dependency
  current_user: User = Depends(get_current_user),
  db: Session = Depends(get_db) # Added db dependency
):
  log_activity(db, current_user.id, "VIEW_PROFILE", "User viewed their profile", request.client.host) # Added log
  return current_user

@app.post("/api/points/transfer")
def transfer_points(
  transfer_data: PointTransferCreate,
  request: Request,
  current_user: User = Depends(get_current_user),
  db: Session = Depends(get_db)
):

  if current_user.is_flagged:
      raise HTTPException(status_code=403, detail="You are temporarily restricted from transfering points due to suspicious activity")
      
  if current_user.points_balance < transfer_data.amount:
      raise HTTPException(status_code=400, detail="Insufficient balance")
  
  to_email_normalized = transfer_data.to_email.strip().lower()

  to_user = db.query(User).filter(func.lower(User.email) == to_email_normalized).first()
  if not to_user:
      raise HTTPException(status_code=404, detail="Recipient not found")
  
  if to_user.id == current_user.id:
      raise HTTPException(status_code=400, detail="Cannot transfer to yourself")
  
  transfer = PointTransfer(
      from_user_id=current_user.id,
      to_user_id=to_user.id,
      amount=transfer_data.amount
  )
  db.add(transfer)
  
  current_user.points_balance -= transfer_data.amount
  to_user.points_balance += transfer_data.amount
  
  db.commit()
  
  log_activity(
    db,
    current_user.id,
    "POINTS_TRANSFER",
    f"Transferred {transfer_data.amount} points to {to_user.email}",
    request.client.host
  )
  
  return {"message": "Transfer successful"}

@app.post("/api/pending-points")
def create_pending_point(data: PendingPointCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    pending_point = PendingPoint(
        user_id=data.user_id,
        amount=data.amount,
        source=data.source,
        earned_at=datetime.utcnow(),
        status="pending"
    )
    db.add(pending_point)
    db.commit()
    db.refresh(pending_point)

    return {
        "message": "Pending point added",
        "pending_point": {
            "id": pending_point.id,
            "amount": pending_point.amount,
            "earned_at": pending_point.earned_at,
            "status": pending_point.status
        }
    }

@app.on_event("startup")
@repeat_every(seconds=60)
def auto_clear_pending_points() -> None:
    db = SessionLocal()
    try:
        now = datetime.utcnow()
        recent_threshold = now - timedelta(minutes=2)

        old_pending = db.query(PendingPoint).filter(
            PendingPoint.status == "pending",
            PendingPoint.earned_at <= recent_threshold
        ).all()

        for point in old_pending:
            user = db.query(User).filter(User.id == point.user_id).first()
            if user:
                user.points_balance += Decimal(str(point.amount))  # ✅ FIXED
                point.status = "cleared"
                db.add_all([user, point])

        db.commit()

        if old_pending:
            print(f"[AUTO] Cleared {len(old_pending)} pending points at {now.isoformat()}")
    except Exception as e:
        print(f"[AUTO] Error clearing points: {e}")
    finally:
        db.close()


@app.on_event("startup")
@repeat_every(seconds=3600)  # Run every hour
def auto_flag_suspicious_behavior() -> None:
    db: Session = SessionLocal()
    try:
        now = datetime.utcnow()
        since_24h = now - timedelta(hours=24)

        # Load rules from FraudRule table into a dict
        rules = {r.rule_key: r for r in db.query(FraudRule).all()}

        # Get all admin IDs to exclude from fraud checks
        admin_ids = {id for (id,) in db.query(User.id).filter(User.is_admin == True).all()}

        # Helper to apply action for background task
        def apply_action_background_task(rule_key, user_id, message):
            """Apply fraud action based on rule for background task."""
            action = rules[rule_key].action.lower()
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                return # User not found, skip

            if action in ["flag", "flag_and_block"]:
                if not db.query(FraudFlag).filter(FraudFlag.user_id == user.id).first():
                    db.add(FraudFlag(user_id=user.id, reason=message))
                    user.is_flagged = True
                    db.add(user) # Add user to session to update is_flagged

            if action in ["block", "flag_and_block"]:
                if user.status != UserStatus.SUSPENDED: # Only change if not already suspended
                    user.status = UserStatus.SUSPENDED
                    db.add(user) # Add user to session to update status

        # --- Rule 1: Shared device fingerprint (all time) ---
        if "max_users_per_fingerprint" in rules:
            limit = rules["max_users_per_fingerprint"].limit_value
            fingerprint_groups = (
                db.query(UserDevice.device_fingerprint)
                .group_by(UserDevice.device_fingerprint)
                .having(func.count(UserDevice.user_id.distinct()) > limit) # Count distinct users
                .all()
            )
            for (fingerprint,) in fingerprint_groups:
                users_on_fingerprint = db.query(UserDevice.user_id).filter(UserDevice.device_fingerprint == fingerprint).distinct().all()
                for (user_id,) in users_on_fingerprint:
                    if user_id not in admin_ids:
                        apply_action_background_task("max_users_per_fingerprint", user_id,
                                     f"Shared fingerprint exceeds limit ({limit}): {fingerprint}")

        # --- Rule 2: Shared IP (24h window) ---
        if "max_ips_per_user_24h" in rules:
            limit = rules["max_ips_per_user_24h"].limit_value
            ip_groups = (
                db.query(UserDevice.ip_address)
                .filter(UserDevice.created_at >= since_24h)
                .group_by(UserDevice.ip_address)
                .having(func.count(UserDevice.user_id.distinct()) > limit) # Count distinct users
                .all()
            )
            for (ip_address,) in ip_groups:
                users_on_ip = db.query(UserDevice.user_id).filter(
                    UserDevice.ip_address == ip_address,
                    UserDevice.created_at >= since_24h
                ).distinct().all()
                for (user_id,) in users_on_ip:
                    if user_id not in admin_ids:
                        apply_action_background_task("max_ips_per_user_24h", user_id,
                                     f"Shared IP in last 24h exceeds limit ({limit}): {ip_address}")

        # --- Rule 3: Too many signups from same fingerprint in 24h ---
        if "max_signups_per_fingerprint_24h" in rules:
            limit = rules["max_signups_per_fingerprint_24h"].limit_value
            signup_fingerprint_groups = (
                db.query(UserDevice.device_fingerprint)
                .join(User, User.id == UserDevice.user_id) # Join User to filter by User.created_at
                .filter(User.created_at >= since_24h)
                .group_by(UserDevice.device_fingerprint)
                .having(func.count(User.id) > limit) # Count users who signed up
                .all()
            )
            for (fingerprint,) in signup_fingerprint_groups:
                users_signed_up_with_fp = db.query(User.id).join(UserDevice).filter(
                    UserDevice.device_fingerprint == fingerprint,
                    User.created_at >= since_24h
                ).all()
                for (user_id,) in users_signed_up_with_fp:
                    if user_id not in admin_ids:
                        apply_action_background_task("max_signups_per_fingerprint_24h", user_id,
                                     f"Signups from fingerprint in last 24h exceed limit ({limit}): {fingerprint}")

        # --- Rule 4: Too many devices per user (all time) ---
        if "max_devices_per_user" in rules:
            limit = rules["max_devices_per_user"].limit_value
            device_groups = (
                db.query(UserDevice.user_id)
                .group_by(UserDevice.user_id)
                .having(func.count(UserDevice.device_fingerprint.distinct()) > limit) # Count distinct device fingerprints
                .all()
            )
            for (user_id,) in device_groups:
                if user_id not in admin_ids:
                    apply_action_background_task("max_devices_per_user", user_id,
                                 f"Devices linked to account exceed limit ({limit})")

        db.commit() # Commit all changes made by apply_action_background_task
        print(f"[AUTO] Fraud detection task completed at {now.isoformat()}")

    except Exception as e:
        print(f"[AUTO] Error in fraud detection task: {e}")
        db.rollback() # Rollback in case of error
    finally:
        db.close()

@app.get("/api/points/history", response_model=TransferHistory)
def get_transfer_history(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get user's point transfer history"""

    sent_transfers = (
        db.query(PointTransfer)
        .options(joinedload(PointTransfer.from_user), joinedload(PointTransfer.to_user))
        .filter(PointTransfer.from_user_id == current_user.id)
        .all()
    )

    received_transfers = (
        db.query(PointTransfer)
        .options(joinedload(PointTransfer.from_user), joinedload(PointTransfer.to_user))
        .filter(PointTransfer.to_user_id == current_user.id)
        .all()
    )

    all_transfers = sent_transfers + received_transfers

    # Filter out transfers missing from_user or to_user
    valid_transfers = [t for t in all_transfers if t.from_user is not None and t.to_user is not None]

    # Calculate totals only on valid transfers
    total_sent = sum(t.amount for t in sent_transfers if t.to_user is not None)
    total_received = sum(t.amount for t in received_transfers if t.from_user is not None)

    log_activity(
        db, current_user.id, "VIEW_POINT_HISTORY", "User viewed point transfer history", request.client.host
    )

    return TransferHistory(
        transfers=[PointTransferResponse.from_orm(t) for t in valid_transfers],
        total_sent=total_sent,
        total_received=total_received,
      )

# =============================================================================
# REDEMPTION ENDPOINTS
# =============================================================================

@app.get("/api/redemption/rates")
def get_redemption_rates(db: Session = Depends(get_db)):
    btc_setting = get_system_setting(db, "point_to_btc_rate")
    gift_setting = get_system_setting(db, "point_to_gift_rate")

    btc_points = gift_points = btc_value = gift_value = Decimal("0")
    btc_rate = gift_rate = Decimal("0")

    if btc_setting:
        try:
            pts, val = btc_setting.split(":")
            btc_points = Decimal(pts)
            btc_value = Decimal(val)
            btc_rate = btc_value / btc_points
        except:
            pass

    if gift_setting:
        try:
            pts, val = gift_setting.split(":")
            gift_points = Decimal(pts)
            gift_value = Decimal(val)
            gift_rate = gift_value / gift_points
        except:
            pass

    return {
        "bitcoin_rate": str(btc_rate),
        "gift_card_rate": str(gift_rate),
        "base_dollar": str(btc_value if btc_value > 0 else gift_value)
    }

@app.post("/api/redemption/request")
def request_redemption(
  payload: RedemptionCreate,
  request: Request,
  current_user: User = Depends(get_current_user),
  db: Session = Depends(get_db)
):
    btc_setting = get_system_setting(db, "point_to_btc_rate")
    gift_setting = get_system_setting(db, "point_to_gift_rate")

    btc_rate = Decimal("0")
    gift_rate = Decimal("0")

    if btc_setting:
        try:
            btc_pts, btc_val = btc_setting.split(":")
            btc_rate = Decimal(btc_val) / Decimal(btc_pts)
        except:
            pass

    if gift_setting:
        try:
            gift_pts, gift_val = gift_setting.split(":")
            gift_rate = Decimal(gift_val) / Decimal(gift_pts)
        except:
            pass

    if payload.type == RedemptionType.BITCOIN:
        if btc_rate == 0:
            raise HTTPException(status_code=400, detail="Bitcoin redemption is currently unavailable")
        equivalent_value = payload.points_amount * btc_rate
    elif payload.type == RedemptionType.GIFT_CARD:
        if gift_rate == 0:
            raise HTTPException(status_code=400, detail="Gift card redemption is currently unavailable")
        equivalent_value = payload.points_amount * gift_rate
    else:
        raise HTTPException(status_code=400, detail="Invalid redemption type")

    if current_user.is_flagged:
        raise HTTPException(status_code=403, detail="You are temporarily restricted from redeeming points due to suspicious activity")

    if current_user.points_balance < payload.points_amount:
        raise HTTPException(status_code=400, detail="Insufficient points")

    redemption = Redemption(
        user_id=current_user.id,
        type=payload.type,
        points_amount=payload.points_amount,
        equivalent_value=equivalent_value,
        status=RedemptionStatus.PENDING,
        wallet_address=payload.wallet_address,
        email_address=payload.email_address
    )
    db.add(redemption)
    current_user.points_balance -= payload.points_amount

    db.commit()
    db.refresh(redemption)

    log_activity(
        db,
        current_user.id,
        "REDEMPTION_REQUEST",
        f"Requested {payload.points_amount} points redemption for {payload.type}",
        request.client.host
    )

    return RedemptionResponse.from_orm(redemption)

@app.get("/api/redemption/history", response_model=List[RedemptionResponse])
def get_redemption_history(
  request: Request, # Added Request dependency
  current_user: User = Depends(get_current_user),
  db: Session = Depends(get_db)
):
  """Get user's redemption history"""
  redemptions = db.query(Redemption).filter(Redemption.user_id == current_user.id).all()
  log_activity(db, current_user.id, "VIEW_REDEMPTION_HISTORY", "Viewed redemption history", request.client.host) # Added log
  return [RedemptionResponse.from_orm(r) for r in redemptions]

# =============================================================================
# AGENT ENDPOINTS
# =============================================================================

@app.get("/api/agent/approve/{token}")
def agent_approve_user(token: str, action: str = Query(...), db: Session = Depends(get_db)):
    approval = db.query(UserApproval).filter(UserApproval.approval_token == token).first()
    if not approval:
        return RedirectResponse(f"{FRONTEND_BASE_URL}/approval-invalid")
    
    user = db.query(User).filter(User.id == approval.user_id).first()
    if not user:
        return RedirectResponse(f"{FRONTEND_BASE_URL}/approval-invalid")
    
    if user.status in [UserStatus.APPROVED, UserStatus.REJECTED]:
        return RedirectResponse(f"{FRONTEND_BASE_URL}/approval-invalid")

    if action == "approve":
        user.status = UserStatus.APPROVED
        approval.status = UserStatus.APPROVED
        db.commit()
        return RedirectResponse(f"{FRONTEND_BASE_URL}/approval-success")
    
    elif action == "reject":
        db.delete(approval)
        db.delete(user)
        db.commit()
        return RedirectResponse(f"{FRONTEND_BASE_URL}/approval-declined")
    
    else:
        return RedirectResponse(f"{FRONTEND_BASE_URL}/approval-invalid")

# =============================================================================
# ADMIN ENDPOINTS
# =============================================================================

@app.get("/api/admin/dashboard/stats", response_model=AdminDashboardStats) # NEW
def get_admin_dashboard_stats(admin_user: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    """Get global admin dashboard statistics (Admin only)"""
    total_users = db.query(User).count()
    total_surveys_completed = db.query(UserSurvey).count()
    total_points_distributed = db.query(func.sum(PointTransfer.amount)).scalar() or Decimal(0)
    pending_redemptions = db.query(Redemption).filter(Redemption.status == RedemptionStatus.PENDING).count()
    
    reward_percentage_setting = db.query(SystemSettings).filter(SystemSettings.key == "system_reward_percentage").first()
    reward_percentage = reward_percentage_setting.value if reward_percentage_setting else "N/A"

    return AdminDashboardStats(
        total_users=total_users,
        total_surveys_completed=total_surveys_completed,
        total_points_distributed=total_points_distributed,
        pending_redemptions=pending_redemptions,
        reward_percentage=reward_percentage
    )

@app.get("/api/admin/fraud/rules", response_model=List[FraudRuleUpdate]) # Updated response model
def get_fraud_rules(admin_user: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    """Get all fraud rules for admin."""
    rules = db.query(FraudRule).all()
    return [FraudRuleUpdate(
        rule_key=r.rule_key, # Include rule_key for client-side mapping
        limit_value=r.limit_value,
        action=r.action,
        description=r.description # Include description
    ) for r in rules]


@app.post("/api/admin/fraud/rules/{rule_key}")
def update_fraud_rule(rule_key: str, data: FraudRulePatch, admin_user: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    """Update fraud rule limit and action."""
    rule = db.query(FraudRule).filter(FraudRule.rule_key == rule_key).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Fraud rule not found")

    rule.limit_value = data.limit_value
    rule.action = data.action
    # Description is not updated via this endpoint, it's static for default rules
    db.commit()
    db.refresh(rule)
    return {"message": "Fraud rule updated successfully", "rule": FraudRuleUpdate(
        rule_key=rule.rule_key,
        limit_value=rule.limit_value,
        action=rule.action,
        description=rule.description
    )}

@app.get("/api/admin/users", response_model=List[UserResponse])
def get_all_users(admin_user: User = Depends(get_admin_user), db: Session = Depends(get_db)):
  """Get all users (Admin only)"""
  users_with_referred_count = []
  all_users = db.query(User).all()
  for user in all_users:
      user_response = UserResponse.from_orm(user)
      if user.is_agent and user.referral_code:
          referred_count = db.query(User).filter(User.referred_by_code == user.referral_code).count()
          user_response.referred_users_count = referred_count
      users_with_referred_count.append(user_response)
  return users_with_referred_count

@app.get("/api/admin/fraud-flags", response_model=List[FraudFlagResponse])
def get_fraud_flags(admin_user: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    flags = db.query(FraudFlag).options(joinedload(FraudFlag.user)).all() # Eager load user
    return [FraudFlagResponse(
        user=BasicUserInfo.from_orm(f.user),
        reason=f.reason,
        created_at=f.created_at
    ) for f in flags]

@app.delete("/api/admin/fraud-flags/{user_id}")
def clear_fraud_flag(
    user_id: int,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 1. Remove fraud flag
    flag = db.query(FraudFlag).filter(FraudFlag.user_id == user_id).first()
    if not flag:
        raise HTTPException(status_code=404, detail="Fraud flag not found for this user")
    db.delete(flag)

    # 2. Remove all device tracking for this user
    db.query(UserDevice).filter(UserDevice.user_id == user_id).delete()

    # 3. Update user's is_flagged status
    user.is_flagged = False
    db.add(user)

    db.commit()

    return {
        "message": "Fraud flag and tracking data cleared successfully. User's flagged status reset."
    }

@app.put("/api/admin/users/{user_id}/status")
def update_user_status(
    user_id: int,
    status_update: UserStatusUpdate,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Update user status (Admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Reject and permanently delete user
    if status_update.status == "rejected":
        db.delete(user)
        db.commit()
        return {"message": f"User {user.email} rejected and permanently deleted."}

    # Update user status
    user.status = status_update.status

    # Demote agent and clear referral code
    if user.is_agent and getattr(status_update, "is_agent", True) is False:
        user.is_agent = False
        user.referral_code = None

    db.commit()
    return {"message": f"User status updated to {status_update.status}"}

@app.put("/api/admin/users/bulk-status")
def bulk_update_user_status(
    bulk_update: BulkUserStatusUpdate,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Bulk update user statuses (Admin only)"""
    updated_count = 0
    deleted_count = 0

    for user_id in bulk_update.user_ids:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            continue

        if bulk_update.status == "rejected":
            db.delete(user)
            deleted_count += 1
        else:
            user.status = bulk_update.status

            # If demoting agent, clear referral code
            if user.is_agent and getattr(bulk_update, "is_agent", None) is False:
                user.is_agent = False
                user.referral_code = None

            db.add(user)
            updated_count += 1

    db.commit()
    return {
        "message": f"Successfully updated {updated_count} users to '{bulk_update.status}'",
        "deleted": deleted_count
    }

@app.put("/api/admin/users/{user_id}/agent")
def assign_agent_role(
    user_id: int,
    agent_data: AgentAssignment,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Assign or remove agent role (Admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_agent = agent_data.is_agent

    if agent_data.is_agent:
        # Assign referral code if they don’t already have one
        if not user.referral_code:
            user.referral_code = generate_referral_code()
    else:
        # Clear referral code when agent is removed
        user.referral_code = None

    db.commit()

    return {
        "message": f"Agent role {'assigned' if agent_data.is_agent else 'removed'}",
        "referral_code": user.referral_code
    }
    
@app.get("/api/admin/redemptions", response_model=List[AdminRedemptionResponse])
def get_all_redemptions(admin_user: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    redemptions = (
        db.query(Redemption)
        .options(joinedload(Redemption.user))
        .order_by(Redemption.status.asc(), Redemption.created_at.desc())
        .all()
    )

    return [
        AdminRedemptionResponse(
            id=r.id,
            type=r.type,
            points_amount=r.points_amount,
            equivalent_value=r.equivalent_value,
            status=r.status,
            created_at=r.created_at,
            user_id=r.user_id,
            user_email=r.user.email,
            destination=r.wallet_address if r.type.strip().lower() == "bitcoin" else r.email_address
        )
        for r in redemptions
    ]
      
@app.put("/api/admin/redemptions/{redemption_id}/process")
def process_redemption(redemption_id: int, action: str = Query(...), admin_user: User = Depends(get_admin_user), db: Session = Depends(get_db)):
  """Process redemption request (Admin only)"""
  redemption = db.query(Redemption).filter(Redemption.id == redemption_id).first()
  if not redemption:
      raise HTTPException(status_code=404, detail="Redemption not found")
  
  user = db.query(User).filter(User.id == redemption.user_id).first()
  
  if action == "approve":
      redemption.status = RedemptionStatus.APPROVED
      redemption.processed_by = admin_user.id
      redemption.processed_at = datetime.utcnow()
      message = "Redemption approved"
  elif action == "reject":
      redemption.status = RedemptionStatus.REJECTED
      redemption.processed_by = admin_user.id
      redemption.processed_at = datetime.utcnow()
      # Refund points to user
      user.points_balance += redemption.points_amount
      message = "Redemption rejected and points refunded"
  else:
      raise HTTPException(status_code=400, detail="Invalid action")
  
  db.commit()
  
  return {"message": message}

@app.get("/api/admin/settings", response_model=List[SystemSettingUpdate]) # NEW
def get_all_system_settings(admin_user: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    """Get all system settings (Admin only)"""
    settings = db.query(SystemSettings).all()
    return [{"key": s.key, "value": s.value, "description": s.description} for s in settings]

@app.get("/api/admin/point-transfers")
def get_point_transfers(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 5,
    date: str = None,
    email: str = None
):
    query = db.query(PointTransfer)

    # Filter by date (YYYY-MM-DD)
    if date:
        try:
            from datetime import datetime, timedelta
            day_start = datetime.strptime(date, "%Y-%m-%d")
            day_end = day_start + timedelta(days=1)
            query = query.filter(PointTransfer.created_at >= day_start, PointTransfer.created_at < day_end)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    # Filter by email (sender or receiver)
    if email:
        query = query.join(User, ((PointTransfer.from_user_id == User.id) | (PointTransfer.to_user_id == User.id))) \
                     .filter(User.email.ilike(f"%{email}%"))

    transfers = query.order_by(PointTransfer.created_at.desc()).offset(skip).limit(limit).all()

    result = []
    for t in transfers:
        result.append({
            "from_user": {"email": t.from_user.email if t.from_user else "N/A"},
            "to_user": {"email": t.to_user.email if t.to_user else "N/A"},
            "amount": t.amount,
            "created_at": t.created_at
        })
    return result

@app.put("/api/admin/settings")
def update_system_setting(
    setting_data: SystemSettingUpdate,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Update system settings (Admin only)"""

    # Update or create the main setting
    setting = db.query(SystemSettings).filter(SystemSettings.key == setting_data.key).first()
    if setting:
        setting.value = setting_data.value
        if setting_data.description:
            setting.description = setting_data.description
    else:
        setting = SystemSettings(
            key=setting_data.key,
            value=setting_data.value,
            description=setting_data.description
        )
        db.add(setting)

    # Helper to update/create other settings
    def update_setting(key: str, value: str):
        existing = db.query(SystemSettings).filter(SystemSettings.key == key).first()
        if existing:
            existing.value = value
        else:
            db.add(SystemSettings(key=key, value=value))

    # Auto-update bitcoin_rate and base_dollar
    if setting_data.key == "point_to_btc_rate":
        try:
            pts, val = setting_data.value.split(":")
            btc_rate = str(Decimal(val) / Decimal(pts))
            update_setting("bitcoin_rate", btc_rate)
            update_setting("base_dollar", val)
        except Exception as e:
            print("BTC RATE UPDATE ERROR:", e)

    # Auto-update gift_card_rate and base_dollar
    elif setting_data.key == "point_to_gift_rate":
        try:
            pts, val = setting_data.value.split(":")
            gift_rate = str(Decimal(val) / Decimal(pts))
            update_setting("gift_card_rate", gift_rate)
            update_setting("base_dollar", val)
        except Exception as e:
            print("GIFT RATE UPDATE ERROR:", e)

    db.commit()
    return {"message": "Setting updated successfully"}  
  
@app.post("/api/admin/point-transfers")
def admin_send_points(payload: AdminPointTransferRequest, db: Session = Depends(get_db)):
    from_email = payload.from_user_email.strip().lower() if payload.from_user_email else None
    to_email = payload.to_user_email.strip().lower()

    from_user = db.query(User).filter(func.lower(User.email) == from_email).first() if from_email else None
    to_user = db.query(User).filter(func.lower(User.email) == to_email).first()

    if from_email and not from_user:
        raise HTTPException(status_code=404, detail="From user not found")
    if not to_user:
        raise HTTPException(status_code=404, detail="To user not found")

    if from_user and from_user.points_balance < payload.points_amount: # Corrected to points_balance
        raise HTTPException(status_code=400, detail="Insufficient points")

    if from_user:
        from_user.points_balance -= payload.points_amount
    to_user.points_balance += payload.points_amount

    transfer = PointTransfer(
        from_user_id=from_user.id if from_user else None,
        to_user_id=to_user.id,
        amount=payload.points_amount
    )

    db.add(transfer)
    db.commit()

    return {
        "message": "Points transferred successfully",
        "transfer": {
            "from_user": {"email": from_user.email if from_user else "N/A"},
            "to_user": {"email": to_user.email},
            "amount": payload.points_amount,
            "created_at": transfer.created_at
        }
    }

# =============================================================================
# SURVEY MANAGEMENT ENDPOINTS
# =============================================================================

@app.post("/api/admin/surveys", response_model=SurveyResponse)
def create_survey(survey_data: SurveyCreate, admin_user: User = Depends(get_admin_user), db: Session = Depends(get_db)):
  """Create new survey (Admin only)"""
  survey = Survey(
      title=survey_data.title,
      description=survey_data.description,
      points_reward=survey_data.points_reward
  )
  db.add(survey)
  db.commit()
  db.refresh(survey)
  
  return SurveyResponse.from_orm(survey)

@app.get("/api/admin/surveys", response_model=List[SurveyResponse]) # NEW
def get_all_surveys_admin(admin_user: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    """Get all surveys for admin (Admin only)"""
    surveys = db.query(Survey).all()
    return [SurveyResponse.from_orm(s) for s in surveys]


@app.get("/api/surveys/available", response_model=List[ExternalSurvey])
def get_available_surveys(
    request: Request,
    limit: int = 12,
    subid_1: Optional[str] = None,
    subid_2: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Block flagged users
    flag = db.query(FraudFlag).filter(FraudFlag.user_id == current_user.id).first()
    if flag:
        raise HTTPException(
            status_code=403,
            detail="Your account has been flagged for suspicious activity. Contact support."
        )

    try:
        # Get current user IP
        user_ip = request.client.host
        if request.headers.get("X-Forwarded-For"):
            user_ip = request.headers.get("X-Forwarded-For").split(",")[0].strip()

        # Encode User-Agent
        user_agent = request.headers.get("User-Agent", "")
        user_agent_encoded = requests.utils.quote(user_agent, safe="")

        # Generate secure hash (MD5 of ext_user_id + '-' + CPX_RESEARCH_HASH)
        ext_user_id = str(current_user.id)
        raw_hash = f"{ext_user_id}-{os.getenv('CPX_RESEARCH_HASH')}"
        secure_hash = hashlib.md5(raw_hash.encode()).hexdigest()

        # Prepare CPX Research API parameters
        params = {
            "app_id": os.getenv("CPX_RESEARCH_APP_ID"),
            "ext_user_id": ext_user_id,
            "output_method": "api",
            "ip_user": user_ip,
            "user_agent": user_agent_encoded,
            "limit": limit,
            "secure_hash": secure_hash
        }

        # Optional subids
        if subid_1:
            params["subid_1"] = subid_1
        if subid_2:
            params["subid_2"] = subid_2

        # Add profiling info if available
        if (
            getattr(current_user, "date_of_birth", None)
            and getattr(current_user, "gender", None)
            and getattr(current_user, "country_code", None)
            and getattr(current_user, "zip_code", None)
        ):
            params.update({
                "main_info": "true",
                "birthday_day": current_user.date_of_birth.day,
                "birthday_month": current_user.date_of_birth.month,
                "birthday_year": current_user.date_of_birth.year,
                "gender": current_user.gender,  # Use 'M' or 'F' as stored in DB
                "user_country_code": current_user.country_code.upper(),
                "zip_code": current_user.zip_code
            })

        # Make API request
        response = requests.get(
            "https://live-api.cpx-research.com/api/get-surveys.php",
            params=params,
            timeout=10
        )
        response.raise_for_status()
        cpx_data = response.json()
        surveys = cpx_data.get("surveys", []) if isinstance(cpx_data, dict) else []

    except requests.RequestException as e:
        print("CPX Research API error:", str(e))
        return JSONResponse(content=[], status_code=200)
    except Exception as e:
        print("Survey processing error:", str(e))
        return JSONResponse(content=[], status_code=200)

    # Get IDs of already completed surveys
    completed_ids = db.query(UserSurvey.survey_id).filter_by(user_id=current_user.id).all()
    completed_ids = {str(sid[0]) for sid in completed_ids}

    # Filter out completed surveys
    processed_surveys = []
    for survey in surveys:
        survey_id = str(survey.get("id", survey.get("survey_id", "")))
        if survey_id not in completed_ids:
            processed_surveys.append(ExternalSurvey(
                survey_id=survey_id,
                title=survey.get("title", survey.get("name", "Survey")),
                description=survey.get("description", survey.get("desc")),
                points_reward=float(survey.get("points", survey.get("reward", 0))),
                redirect_url=survey.get("href", survey.get("url", survey.get("link", "")))
            ))

    return processed_surveys
    
    
@app.post("/api/surveys/{survey_id}/complete")
def complete_survey(
    survey_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Complete a survey and earn points"""
    survey = db.query(Survey).filter(Survey.id == survey_id).first()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    # Check if user already completed this survey
    existing = db.query(UserSurvey).filter(
        and_(UserSurvey.user_id == current_user.id, UserSurvey.survey_id == survey_id)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Survey already completed")
    
    # Record survey completion
    user_survey = UserSurvey(
        user_id=current_user.id,
        survey_id=survey_id,
        points_earned=survey.points_reward
    )
    db.add(user_survey)
    
    # Add points to user balance
    current_user.points_balance += survey.points_reward
    
    db.commit()
    
    log_activity(
        db,
        current_user.id,
        "SURVEY_COMPLETED",
        f"User completed survey '{survey.title}' and earned {survey.points_reward} points",
        request.client.host
    )
    
    return {"message": "Survey completed successfully", "points_earned": survey.points_reward}


@app.get("/api/bitlabs/callback")
async def bitlabs_callback(request: Request, db: Session = Depends(get_db)):
    try:
        # Get the complete callback URL as received (including path and query string)
        full_url = str(request.url)
        
        # Extract hash parameter from query params
        params = dict(request.query_params)
        received_hash = params.get("hash") or request.headers.get("x-bitlabs-signature")
        if not received_hash:
            return {"status": "ignored", "reason": "Missing signature/hash"}

        # Split URL on &hash= exactly as BitLabs documentation shows
        # This preserves the original URL format without encoding/decoding
        if "&hash=" in full_url:
            url_parts = full_url.split("&hash=")
            payload_for_hash = url_parts[0]  # Everything before &hash=
        else:
            return {"status": "ignored", "reason": "Hash parameter not found in URL"}

        # Verify hash using the payload exactly as BitLabs sent it
        if not verify_hash(payload_for_hash.encode('utf-8'), received_hash):
            return {
                "status": "ignored", 
                "reason": "Invalid signature/hash",
                "payload_for_hash": payload_for_hash
            }

        # --- 5. Extract core fields ---
        tx = params.get("TX") or params.get("transaction_id")
        uid = params.get("UID") or params.get("user_id")
        val = params.get("VAL") or params.get("value")
        raw_val = params.get("RAW") or params.get("raw")
        cb_type = params.get("TYPE") or params.get("type")

        # --- 6. Validate UID and TX ---
        try:
            uid = int(uid)
            if uid <= 0:
                raise ValueError
        except (ValueError, TypeError):
            return {"status": "ignored", "reason": "Invalid UID"}

        if not tx:
            return {"status": "ignored", "reason": "Missing TX"}

        # --- 7. Prevent duplicate processing ---
        if db.query(TransactionLog).filter_by(tx_id=tx).first():
            return {"status": "ok", "reason": "duplicate", "tx": tx}

        db.add(TransactionLog(tx_id=tx, created_at=datetime.utcnow()))
        db.commit()

        # --- 8. Find the user ---
        user = db.query(User).filter(User.id == uid).first()
        if not user:
            return {"status": "ok", "reason": "user not found", "tx": tx}

        # --- 9. Get base dollar rate from system settings ---
        base_dollar_setting = db.query(SystemSettings).filter(SystemSettings.key == "base_dollar").first()
        base_dollar_rate = Decimal(base_dollar_setting.value) if base_dollar_setting else Decimal("1.0")

        # --- 10. Calculate reward ---
        reward_amount = calculate_reward_points(params, base_dollar_rate)
        reward_amount = max(reward_amount, Decimal("0"))
        # --- 11. Credit pending points ---
        if reward_amount > 0:
            pending_point = PendingPoint(
                user_id=user.id,
                amount=float(reward_amount),
                source="bitlabs_reward",
                earned_at=datetime.utcnow(),
                status="pending"
            )
            db.add(pending_point)

            log_activity(
                db,
                user.id,
                "BITLABS_REWARD",
                f"Reward {reward_amount} points credited (TX={tx}, RAW={raw_val}, TYPE={cb_type}).",
                request.client.host if request.client else "unknown"
            )

        db.commit()

        # --- 12. Return success ---
        return {"status": "ok", "tx": tx, "points": float(reward_amount)}

    except Exception as e:
        db.rollback()
        return {"status": "error", "reason": f"Processing failed: {str(e)}"}


@app.get("/api/profiles/webhook")
async def profiles_webhook(request: Request, db: Session = Depends(get_db)):
    try:
        # --- 1. Get the full callback URL as received ---
        full_url = str(request.url)

        # --- 2. Extract hash parameter ---
        params = dict(request.query_params)
        received_hash = params.get("hash") or request.headers.get("x-profile-signature")
        if not received_hash:
            return {"status": "ignored", "reason": "Missing signature/hash"}

        # --- 3. Reconstruct payload exactly as sent, excluding hash ---
        if "&hash=" in full_url:
            url_parts = full_url.split("&hash=")
            payload_for_hash = url_parts[0]  # everything before &hash=
        else:
            return {"status": "ignored", "reason": "Hash parameter not found in URL"}

        # --- 4. Verify hash ---
        if not verify_hash(payload_for_hash.encode('utf-8'), received_hash):
            return {
                "status": "ignored",
                "reason": "Invalid signature/hash",
                "payload_for_hash": payload_for_hash,
                "received_hash": received_hash
            }

        # --- 5. Extract core fields ---
        tx = unquote(params.get("TX", "")) or unquote(params.get("transaction_id", ""))
        uid = unquote(params.get("UID", "")) or unquote(params.get("user_id", ""))
        val = unquote(params.get("VAL", "")) or unquote(params.get("value", ""))
        raw_val = unquote(params.get("RAW", "")) or unquote(params.get("raw", ""))
        cb_type = unquote(params.get("TYPE", "")) or unquote(params.get("type", ""))

        # --- 6. Validate UID and TX ---
        try:
            uid = int(uid)
            if uid <= 0:
                raise ValueError
        except (ValueError, TypeError):
            return {"status": "ignored", "reason": "Invalid UID"}

        if not tx:
            return {"status": "ignored", "reason": "Missing TX"}

        # --- 7. Prevent duplicate processing ---
        if db.query(TransactionLog).filter_by(tx_id=tx).first():
            return {"status": "ok", "reason": "duplicate", "tx": tx}

        db.add(TransactionLog(tx_id=tx, created_at=datetime.utcnow()))
        db.commit()

        # --- 8. Find the user ---
        user = db.query(User).filter(User.id == uid).first()
        if not user:
            return {"status": "ok", "reason": "user not found", "tx": tx}

        # --- 9. Get base dollar rate from system settings ---
        base_dollar_setting = db.query(SystemSettings).filter(SystemSettings.key == "base_dollar").first()
        base_dollar_rate = Decimal(base_dollar_setting.value) if base_dollar_setting else Decimal("1.0")

        # --- 10. Calculate reward points ---
        reward_amount = calculate_reward_points(params, base_dollar_rate)
        reward_amount = max(reward_amount, Decimal("0"))

        # --- 11. Credit pending points safely ---
        if reward_amount > 0:
            pending_point = PendingPoint(
                user_id=user.id,
                amount=float(reward_amount),
                source="profile_completion",
                earned_at=datetime.utcnow(),
                status="pending"
            )
            db.add(pending_point)

            log_activity(
                db,
                user.id,
                "PROFILE_COMPLETED_WEBHOOK",
                f"Profile completed and {reward_amount} points added to pending balance "
                f"(TX={tx}, RAW={raw_val}, TYPE={cb_type}, base dollar rate: {base_dollar_rate}).",
                request.client.host if request.client else "unknown"
            )

        db.commit()

        # --- 12. Return success ---
        return {"status": "ok", "tx": tx, "points": float(reward_amount)}

    except Exception as e:
        db.rollback()
        return {"status": "error", "reason": f"Processing failed: {str(e)}"}
    

@app.get("/api/reconcile/earnings")
async def reconcile_earnings(request: Request, db: Session = Depends(get_db)):
    try:
        # --- 1. Get full URL as received ---
        full_url = str(request.url)

        # --- 2. Extract query params manually ---
        params = dict(request.query_params)
        signature = params.get("hash") or request.headers.get("x-bitlabs-signature")
        if not signature:
            return {"status": "ignored", "reason": "Missing signature/hash"}

        # --- 3. Reconstruct payload exactly as sent, excluding hash ---
        if "&hash=" in full_url:
            payload_for_hash = full_url.split("&hash=")[0]
        else:
            return {"status": "ignored", "reason": "Hash parameter not found in URL"}

        # --- 4. Verify hash ---
        if not verify_hash(payload_for_hash.encode("utf-8"), signature):
            return {
                "status": "ignored",
                "reason": "Invalid signature/hash",
                "payload_for_hash": payload_for_hash,
                "received_hash": signature
            }

        # --- 5. Extract core fields ---
        from urllib.parse import unquote
        tx = unquote(params.get("TX", "")) or unquote(params.get("transaction_id", ""))
        uid = unquote(params.get("UID", "")) or unquote(params.get("user_id", ""))
        val = unquote(params.get("VAL", "")) or unquote(params.get("value", ""))
        raw_val = unquote(params.get("RAW", "")) or unquote(params.get("raw", ""))
        cb_type = unquote(params.get("TYPE", "")) or unquote(params.get("type", ""))
        chargebacks = params.get("chargebacks", [])

        # --- 6. Validate UID and TX ---
        try:
            uid = int(uid)
            if uid <= 0:
                raise ValueError
        except (ValueError, TypeError):
            return {"status": "ignored", "reason": "Invalid UID"}

        if not tx:
            return {"status": "ignored", "reason": "Missing TX"}

        # --- 7. Prevent duplicate processing ---
        if db.query(TransactionLog).filter_by(tx_id=tx).first():
            return {"status": "ok", "reason": "duplicate", "tx": tx}

        db.add(TransactionLog(tx_id=tx, created_at=datetime.utcnow()))
        db.commit()

        # --- 8. Find user ---
        user = db.query(User).filter(User.id == uid).first()
        if not user:
            return {"status": "ok", "reason": "user not found", "tx": tx}

        # --- 9. Process chargebacks ---
        total_deducted = Decimal("0.00")
        processed_chargebacks = []

        for chargeback in chargebacks:
            chargeback_amount = Decimal(str(chargeback.get("amount", "0"))).quantize(Decimal("0.01"))
            earning_id = (
                chargeback.get("earning_id")
                or chargeback.get("survey_id")
                or chargeback.get("offer_id")
                or chargeback.get("game_id")
            )
            reason = chargeback.get("reason", "Unqualified/Invalid completion")

            if chargeback_amount > 0:
                pending_points = db.query(PendingPoint).filter(
                    PendingPoint.user_id == user.id,
                    PendingPoint.survey_id == earning_id,
                    PendingPoint.source == cb_type,
                    PendingPoint.status == "pending"
                ).first()

                if pending_points:
                    pending_points.amount -= chargeback_amount
                    if pending_points.amount <= 0:
                        pending_points.status = (
                            "chargeback_deducted" if pending_points.amount == 0 else "negative_pending"
                        )
                else:
                    negative_pending = PendingPoint(
                        user_id=user.id,
                        amount=-chargeback_amount,
                        source=cb_type,
                        survey_id=earning_id,
                        earned_at=datetime.utcnow(),
                        status="negative_pending"
                    )
                    db.add(negative_pending)

                total_deducted += chargeback_amount
                processed_chargebacks.append({
                    "source": cb_type,
                    "earning_id": earning_id,
                    "amount": str(chargeback_amount),
                    "reason": reason
                })

                # --- Activity log ---
                log_activity(
                    db,
                    user.id,
                    "CHARGEBACK_PROCESSED",
                    f"Chargeback of {chargeback_amount} points for {cb_type} {earning_id}. Reason: {reason}",
                    request.client.host if request.client else "unknown"
                )

        db.commit()

        # --- 10. Return success ---
        return {
            "status": "ok",
            "tx": tx,
            "processed_count": len(processed_chargebacks),
            "total_deducted": str(total_deducted),
            "chargebacks": processed_chargebacks
        }

    except Exception as e:
        db.rollback()
        return {"status": "error", "reason": f"Reconciliation failed: {str(e)}"}
                


@app.get("/api/surveys/bitlabs/url")
def get_bitlabs_offerwall_url(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Block flagged users
    flag = db.query(FraudFlag).filter(FraudFlag.user_id == current_user.id).first()
    if flag:
        raise HTTPException(
            status_code=403,
            detail="Your account has been flagged for suspicious activity. Contact support."
        )

    # Ensure token exists
    if not BITLABS_APP_TOKEN:
        raise HTTPException(status_code=500, detail="BitLabs app token not configured")

    # Use internal user_id as UID
    uid = current_user.id  

    # Build BitLabs URL
    offerwall_url = (
        f"{BITLABS_BASE_URL}/?uid={uid}&token={BITLABS_APP_TOKEN}"
        f"&theme=DARK&currency=Points"
    )

    return {"url": offerwall_url}


@app.api_route("/api/surveys/cpxresearch/webhook", methods=["GET", "POST"])
async def cpx_research_webhook(request: Request, db: Session = Depends(get_db)):
    """
    CPX Research webhook for survey completions and callbacks/reversals.
    Supports both GET and POST methods.
    """
    
    # Get parameters from either GET query params or POST form data
    if request.method == "POST":
        try:
            form_data = await request.form()
            params = dict(form_data)
        except Exception:
            # Try JSON if form data fails
            try:
                params = await request.json()
            except Exception:
                raise HTTPException(status_code=400, detail="Invalid POST payload")
    else:  # GET
        params = dict(request.query_params)
    
    # Extract required parameters
    status = params.get("status")
    trans_id = params.get("trans_id")
    user_id = params.get("user_id")
    sub_id = params.get("sub_id")
    sub_id_2 = params.get("sub_id_2")
    amount_local = params.get("amount_local")
    amount_usd = params.get("amount_usd")  # This is publisher payout, not user reward
    points = params.get("points") or params.get("amount_local")  # CPX sends user reward in points
    offer_id = params.get("offer_id")
    received_hash = params.get("hash")
    ip_click = params.get("ip_click")
    
    # Validate required parameters
    if not all([status, trans_id, user_id, received_hash]):
        raise HTTPException(status_code=400, detail="Missing required parameters")
    
    # Verify hash signature
    if not verify_cpx_research_hash(params, received_hash):
        raise HTTPException(status_code=401, detail="Invalid hash signature")
    
    # Check for duplicate transactions
    existing_tx = db.query(TransactionLog).filter_by(tx_id=trans_id).first()
    if existing_tx:
        return {"message": "Duplicate transaction ignored", "tx_id": trans_id}
    
    # Get user by ID or email
    user = None
    if user_id.isdigit():
        user = db.query(User).filter(User.id == int(user_id)).first()
    else:
        user = db.query(User).filter(func.lower(User.email) == user_id.lower()).first()
    
    if not user:
        # Log transaction even for unknown users
        db.add(TransactionLog(tx_id=trans_id, created_at=datetime.utcnow()))
        db.commit()
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get base dollar rate from system settings
    base_dollar_setting = db.query(SystemSettings).filter(SystemSettings.key == "base_dollar").first()
    base_dollar_rate = Decimal(base_dollar_setting.value) if base_dollar_rate else Decimal("1.0")
    
    # Always log transaction to prevent replay attacks
    db.add(TransactionLog(tx_id=trans_id, created_at=datetime.utcnow()))
    
    # Process based on status
    if status == "1":  # Completion
        reward_payload = {}
        if amount_usd:
            # If CPX provides USD amount, use it directly for calculation
            reward_payload["USD"] = amount_usd
        elif points:
            # If only points provided, map to VAL for points-based calculation
            reward_payload["VAL"] = points
        else:
            reward_payload["VAL"] = "0"
        
        reward_amount = calculate_reward_points(reward_payload, base_dollar_rate)
        
        if reward_amount > 0:
            # Add pending points
            pending_point_entry = PendingPoint(
                user_id=user.id,
                amount=float(reward_amount),
                source="cpx_research_survey",
                survey_id=offer_id,
                earned_at=datetime.utcnow(),
                status="pending"
            )
            db.add(pending_point_entry)
            
            # Log activity
            log_activity(
                db,
                user.id,
                "CPX_RESEARCH_COMPLETED",
                f"CPX Research offer {offer_id} completed and {reward_amount} points added to pending balance (CPX points: {points}, publisher payout: {amount_usd}, base dollar rate: {base_dollar_rate}).",
                ip_click or (request.client.host if request.client else "unknown")
            )
        
        db.commit()
        return {"message": "Survey completion processed", "points_awarded": float(reward_amount)}
        
    elif status == "2":  # Callback/Reversal
        # Find and reverse the original transaction
        original_pending = db.query(PendingPoint).filter(
            PendingPoint.user_id == user.id,
            PendingPoint.survey_id == offer_id,
            PendingPoint.source == "cpx_research_survey"
        ).first()
        
        if original_pending:
            # Remove from pending points
            original_amount = original_pending.amount
            db.delete(original_pending)
            
            # Log reversal activity
            log_activity(
                db,
                user.id,
                "CPX_RESEARCH_REVERSED",
                f"CPX Research offer {offer_id} reversed and {original_amount} points removed from pending balance.",
                ip_click or (request.client.host if request.client else "unknown")
            )
        else:
            # If not in pending, deduct from main balance
            reward_payload = {}
            if amount_usd:
                reward_payload["USD"] = amount_usd
            elif points:
                reward_payload["VAL"] = points
            else:
                reward_payload["VAL"] = "0"
            
            deduct_amount = calculate_reward_points(reward_payload, base_dollar_rate)
            
            if deduct_amount > 0:
                user.points = max(0, user.points - float(deduct_amount))
                
                # Log reversal activity
                log_activity(
                    db,
                    user.id,
                    "CPX_RESEARCH_REVERSED",
                    f"CPX Research offer {offer_id} reversed and {deduct_amount} points deducted from main balance.",
                    ip_click or (request.client.host if request.client else "unknown")
                )
        
        db.commit()
        return {"message": "Survey reversal processed", "status": "reversed"}
    
    else:
        # Unknown status
        db.commit()
        return {"message": "Unknown status received", "status": status}


@app.api_route("/api/surveys/adgem/webhook", methods=["GET", "POST"])
async def adgem_webhook(request: Request, db: Session = Depends(get_db)):
    """
    ADGem webhook for offer completions and reversals.
    Mirrors CPX Research webhook logic.
    """

    # Get parameters from request
    if request.method == "POST":
        try:
            form_data = await request.form()
            params = dict(form_data)
        except Exception:
            try:
                params = await request.json()
            except Exception:
                raise HTTPException(status_code=400, detail="Invalid POST payload")
    else:
        params = dict(request.query_params)

    # Extract required params
    status       = params.get("status")  # 1 = completion, 2 = reversal
    tx_id        = params.get("transaction_id")
    user_id      = params.get("player_id")
    payout_usd   = params.get("payout")
    amount       = params.get("amount")
    goal_id      = params.get("goal_id")
    goal_name    = params.get("goal_name")
    offer_id     = params.get("offer_id")
    offer_name   = params.get("offer_name")
    verifier     = params.get("verifier")

    # Validate required params
    if not all([status, tx_id, user_id, verifier]):
        raise HTTPException(status_code=400, detail="Missing required parameters")

    # Verify HMAC signature
    if not verify_adgem_signature(params, verifier):
        raise HTTPException(status_code=401, detail="Invalid signature")

    # Check duplicate transactions
    existing_tx = db.query(TransactionLog).filter_by(tx_id=tx_id).first()
    if existing_tx:
        return {"message": "Duplicate transaction ignored", "tx_id": tx_id}

    # Get user
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        db.add(TransactionLog(tx_id=tx_id, created_at=datetime.utcnow()))
        db.commit()
        raise HTTPException(status_code=404, detail="User not found")

    # Get base dollar rate
    base_dollar_setting = db.query(SystemSettings).filter(SystemSettings.key == "base_dollar").first()
    base_dollar_rate = Decimal(base_dollar_setting.value) if base_dollar_setting else Decimal("1.0")

    # Always log transaction
    db.add(TransactionLog(tx_id=tx_id, created_at=datetime.utcnow()))

    reward_payload = {}
    if payout_usd:
        # Pass USD value directly, let calculate_reward_points handle the conversion
        reward_payload["USD"] = payout_usd
    elif amount:
        # If amount is provided, treat as points value
        reward_payload["VAL"] = amount
    else:
        reward_payload["VAL"] = "0"

    reward_amount = calculate_reward_points(reward_payload, base_dollar_rate)

    # Handle status
    if status == "1":  # Completion
        if reward_amount > 0:
            pending_point_entry = PendingPoint(
                user_id=user.id,
                amount=float(reward_amount),
                source="adgem_offerwall",
                survey_id=offer_id,
                earned_at=datetime.utcnow(),
                status="pending"
            )
            db.add(pending_point_entry)

            log_activity(
                db,
                user.id,
                "ADGEM_COMPLETED",
                f"ADGem offer {offer_name} ({offer_id}) completed, {reward_amount} points added (USD payout: {payout_usd}, amount: {amount}, base rate: {base_dollar_rate}).",
                request.client.host if request.client else "unknown"
            )

        db.commit()
        return {"message": "Offer completion processed", "points_awarded": float(reward_amount)}

    elif status == "2":  # Reversal
        original_pending = db.query(PendingPoint).filter(
            PendingPoint.user_id == user.id,
            PendingPoint.survey_id == offer_id,
            PendingPoint.source == "adgem_offerwall"
        ).first()

        if original_pending:
            original_amount = original_pending.amount
            db.delete(original_pending)

            log_activity(
                db,
                user.id,
                "ADGEM_REVERSED",
                f"ADGem offer {offer_name} ({offer_id}) reversed, {original_amount} points removed.",
                request.client.host if request.client else "unknown"
            )
        else:
            if reward_amount > 0:
                user.points = max(0, user.points - float(reward_amount))
                log_activity(
                    db,
                    user.id,
                    "ADGEM_REVERSED",
                    f"ADGem offer {offer_name} ({offer_id}) reversed, {reward_amount} points deducted from balance.",
                    request.client.host if request.client else "unknown"
                )

        db.commit()
        return {"message": "Offer reversal processed", "status": "reversed"}

    else:
        db.commit()
        return {"message": "Unknown status received", "status": status}


@app.api_route("/webhook/adgem-ban", methods=["GET", "POST"])
async def adgem_banned_webhook(request: Request, db: Session = Depends(get_db)):
    """
    AdGem Banned Player Webhook (player.banned / player.unbanned).
    Matches player_id with our DB user_id.
    """

    if request.method == "GET":
        return {"status": "ready", "message": "AdGem banned webhook endpoint active"}

    body_bytes = await request.body()
    received_sig = request.headers.get("Signature")

    # Verify webhook signature
    if not verify_adgem_webhook_signature(body_bytes, received_sig):
        raise HTTPException(status_code=401, detail="Invalid signature")

    payload = await request.json()
    event_type = payload.get("type")  # "player.banned" or "player.unbanned"
    data = payload.get("data", {})

    # Match our DB field (user_id)
    player_id = data.get("player_id")
    try:
        player_id = int(player_id)  # ensure int for DB lookup
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="Invalid player_id")

    user = db.query(User).filter_by(id=player_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update ban status
    if event_type == "player.banned":
        user.is_banned = True
    elif event_type == "player.unbanned":
        user.is_banned = False
    else:
        raise HTTPException(status_code=400, detail="Unsupported event type")

    db.commit()
    return {"status": "ok", "user_id": player_id, "event": event_type}


@app.get("/api/surveys/adgem/available", response_model=List[ExternalSurvey])
def get_adgem_available_surveys(
    request: Request,
    limit: int = 12,
    subid_1: Optional[str] = None,
    subid_2: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Block flagged users
    flag = db.query(FraudFlag).filter(FraudFlag.user_id == current_user.id).first()
    if flag:
        raise HTTPException(
            status_code=403,
            detail="Your account has been flagged for suspicious activity. Contact support."
        )

    try:
        # Get current user IP
        user_ip = request.client.host
        if request.headers.get("X-Forwarded-For"):
            user_ip = request.headers.get("X-Forwarded-For").split(",")[0].strip()

        # Encode User-Agent
        user_agent = request.headers.get("User-Agent", "")
        user_agent_encoded = requests.utils.quote(user_agent, safe="")

        # Prepare AdGem API parameters
        params = {
            "appid": os.getenv("ADGEM_APP_ID"),
            "playerid": str(current_user.id),
            "output_method": "api",
            "ip": user_ip,
            "useragent": user_agent_encoded,
            "limit": limit
        }

        # Optional subids
        if subid_1:
            params["subid_1"] = subid_1
        if subid_2:
            params["subid_2"] = subid_2

        # Make API request
        response = requests.get(
            "https://api.adgem.com/v1/wall/json",
            params=params,
            timeout=10
        )
        response.raise_for_status()
        adgem_data = response.json()
        offers = adgem_data.get("offers", []) if isinstance(adgem_data, dict) else []

    except requests.RequestException as e:
        print("AdGem API error:", str(e))
        return JSONResponse(content=[], status_code=200)
    except Exception as e:
        print("Offer processing error:", str(e))
        return JSONResponse(content=[], status_code=200)

    # Filter out completed offers
    completed_ids = db.query(UserSurvey.survey_id).filter_by(user_id=current_user.id).all()
    completed_ids = {str(sid[0]) for sid in completed_ids}

    processed_offers = []
    for offer in offers:
        offer_id = str(offer.get("id", offer.get("survey_id", "")))
        if offer_id not in completed_ids:
            processed_offers.append(ExternalSurvey(
                survey_id=offer_id,
                title=offer.get("name", "Offer"),
                description=offer.get("description", ""),
                points_reward=float(offer.get("reward", 0)),
                redirect_url=offer.get("url", "")
            ))

    return processed_offers

# =============================================================================
# HEALTH CHECK ENDPOINT
# =============================================================================

@app.get("/")
def root():
    """Public health check endpoint"""
    return {
        "message": "✅ Survecta API is online",
        "version": "1.0.0",
        "status": "operational"
    }
    
@app.api_route("/health", methods=["GET", "HEAD"])
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "database": "connected",
        "email_service": "configured"
    }

# Removed the activity_logger middleware as requested.

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/activity")
def get_recent_activity(
  db: Session = Depends(get_db),
  current_user: User = Depends(get_current_user)
):
  logs = (
      db.query(ActivityLog)
      .filter(ActivityLog.user_id == current_user.id)
      .order_by(ActivityLog.created_at.desc()) # ✅ corrected from timestamp to created_at
      .limit(10)
      .all()
  )
  return [
      {
          "type": log.action, # ✅ corrected from log_type to action
          "message": log.details, # ✅ corrected from message to details
          "timestamp": log.created_at.isoformat() # ✅ corrected from timestamp to created_at
      }
      for log in logs
  ]

app.include_router(router, prefix="/api")

# =============================================================================
# RUN THE APPLICATION
# =============================================================================
if __name__ == "__main__":
    create_tables()
    import uvicorn

    print("=" * 60)
    print("🚀 STARTING SURVECTA API")
    print("=" * 60)
    print("✅ Admin credentials loaded securely from environment variables.")
    print(f"🌐 API Documentation: {BASE_URL}/docs")
    print(f"💾 Database: {DATABASE_URL}")
    print("=" * 60)

    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=10000,
        reload=False,
        log_level="info"
    )
