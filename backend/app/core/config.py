from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv
import os

# Load .env file from the root directory
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
DOTENV_PATH = os.path.join(ROOT_DIR, ".env")

# Load the .env file
load_dotenv(DOTENV_PATH)

class Settings(BaseSettings):
    APP_NAME: str
    DATABASE_URL: str
    FILE_DIR: str

    model_config = SettingsConfigDict(env_file=DOTENV_PATH, extra="allow")

settings = Settings()
