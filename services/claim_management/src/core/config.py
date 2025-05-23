from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str
    POLICY_SERVICE_URL: str
    CONFIG_SERVICE_URL: str
    API_V1_STR: str = "/api/v1"
    model_config = ConfigDict(from_attributes=True)

settings = Settings()