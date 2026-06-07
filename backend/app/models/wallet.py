from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func
from app.core.database import Base


class Wallet(Base):
    __tablename__ = "wallets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    balance = Column(Float, default=0.0)
    currency = Column(String, default="NGN")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class WalletTransaction(Base):
    __tablename__ = "wallet_transactions"

    id = Column(Integer, primary_key=True, index=True)
    wallet_id = Column(Integer, ForeignKey("wallets.id"), nullable=False)
    amount = Column(Float, nullable=False)
    type = Column(String, nullable=False)
    reference = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)
    status = Column(String, default="completed")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
