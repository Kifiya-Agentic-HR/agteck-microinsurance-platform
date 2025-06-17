from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from dotenv import load_dotenv
import os

# Load .env manually
dotenv_path = os.path.join(os.path.dirname(__file__), "..", "..", ".env")
load_dotenv(dotenv_path=os.path.abspath(dotenv_path))  # resolves .env path

class Settings(BaseSettings):
    REDIS_HOST: str
    DATABASE_URL: str
    DFS_SERVICE_URL: str
    PRODUCT_SERVICE_URL: str
    API_V1_STR: str = "/api"

    model_config = ConfigDict(from_attributes=True)

settings = Settings()
