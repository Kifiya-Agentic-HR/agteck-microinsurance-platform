from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://user:pass1234@localhost:5432/dfs_db"
    POLICY_SERVICE_URL: str = "http://POLICY_SERVICE:8000"
    API_V1_STR: str = "/api"
    model_config = ConfigDict(from_attributes=True)

settings = Settings()

