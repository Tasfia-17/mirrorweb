import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-in-production")
JWT_LIFETIME_SECONDS = int(os.getenv("JWT_LIFETIME_SECONDS", "2592000"))  # 30 days
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./mirror.db")
MIRROR_PIPELINE_PATH = os.getenv("MIRROR_PIPELINE_PATH", "./pipeline")
