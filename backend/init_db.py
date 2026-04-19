from database import SessionLocal, engine, Base
from models import User
from auth import get_password_hash

def create_default_user():
    Base.metadata.create_all(bind=engine)  # Create tables
    db = SessionLocal()
    user = db.query(User).filter(User.email == "admin").first()
    if not user:
        hashed_password = get_password_hash("1234")
        user = User(email="admin", hashed_password=hashed_password)
        db.add(user)
        db.commit()
    db.close()

if __name__ == "__main__":
    create_default_user()
    print("Usuario por defecto creado: admin / 1234")