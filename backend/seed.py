import asyncio
from sqlalchemy import select
from app.core.database import async_session
from app.core.security import hash_password
from app.models.user import User


async def seed_admin():
    async with async_session() as db:
        result = await db.execute(select(User).where(User.email == "admin@example.com"))
        if result.scalar_one_or_none():
            print("Admin account already exists.")
            return

        admin = User(
            email="admin@example.com",
            full_name="Admin",
            phone=None,
            password_hash=hash_password("admin123"),
            role="super_admin",
            is_verified=True,
            verification_token=None,
            verification_channel="email",
        )
        db.add(admin)
        await db.commit()
        print("Default admin account created (admin@example.com / admin123)")


if __name__ == "__main__":
    asyncio.run(seed_admin())
