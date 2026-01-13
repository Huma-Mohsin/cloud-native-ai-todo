"""Application configuration module.

This module handles loading and validating environment variables for the application.
It uses Pydantic Settings for type-safe configuration management.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables.

    Attributes:
        DATABASE_URL: PostgreSQL connection string (asyncpg format)
        BETTER_AUTH_SECRET: Secret key for JWT token signing (32+ characters)
        CORS_ORIGINS: Comma-separated list of allowed CORS origins
        ENVIRONMENT: Application environment (development/production)
        JWT_ALGORITHM: Algorithm for JWT encoding (default: HS256)
        JWT_EXPIRATION_MINUTES: JWT token expiration time in minutes (default: 1440 = 24 hours)
    """

    DATABASE_URL: str
    BETTER_AUTH_SECRET: str
    CORS_ORIGINS: str = "http://localhost:3000"
    ENVIRONMENT: str = "development"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 1440  # 24 hours

    def __init__(self, **data):
        """Initialize settings and clean up whitespace in DATABASE_URL."""
        if "DATABASE_URL" in data:
            data["DATABASE_URL"] = data["DATABASE_URL"].strip()
        super().__init__(**data)

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", case_sensitive=True, extra="ignore"
    )

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS_ORIGINS into a list of strings.

        Returns:
            List of allowed origin URLs
        """
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    def validate_config(self) -> None:
        """Validate critical configuration values.

        Raises:
            ValueError: If configuration is invalid
        """
        if len(self.BETTER_AUTH_SECRET) < 32:
            raise ValueError("BETTER_AUTH_SECRET must be at least 32 characters long")

        if not self.DATABASE_URL.startswith("postgresql"):
            raise ValueError("DATABASE_URL must be a PostgreSQL connection string")

        if "asyncpg" not in self.DATABASE_URL:
            raise ValueError(
                "DATABASE_URL must use asyncpg driver (e.g., postgresql+asyncpg://...)"
            )


# Global settings instance
settings = Settings()

# Validate on import
settings.validate_config()
