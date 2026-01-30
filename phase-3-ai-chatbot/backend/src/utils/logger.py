"""Logging configuration for Phase III backend.

This module provides structured logging with proper formatting and levels.
"""

import logging
import sys
from datetime import datetime
import os


# Get log level from environment or default to INFO
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")


class ColoredFormatter(logging.Formatter):
    """Custom formatter with colors for development."""

    grey = "\x1b[38;21m"
    blue = "\x1b[38;5;39m"
    yellow = "\x1b[38;5;226m"
    red = "\x1b[38;5;196m"
    bold_red = "\x1b[31;1m"
    reset = "\x1b[0m"

    def __init__(self, fmt):
        super().__init__()
        self.fmt = fmt
        self.FORMATS = {
            logging.DEBUG: self.grey + self.fmt + self.reset,
            logging.INFO: self.blue + self.fmt + self.reset,
            logging.WARNING: self.yellow + self.fmt + self.reset,
            logging.ERROR: self.red + self.fmt + self.reset,
            logging.CRITICAL: self.bold_red + self.fmt + self.reset,
        }

    def format(self, record):
        log_fmt = self.FORMATS.get(record.levelno)
        formatter = logging.Formatter(log_fmt, datefmt="%Y-%m-%d %H:%M:%S")
        return formatter.format(record)


def setup_logger(name: str = "phase3-backend") -> logging.Logger:
    """Set up and configure logger for the application.

    Args:
        name: Logger name (default: "phase3-backend")

    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)

    # Avoid duplicate handlers
    if logger.handlers:
        return logger

    logger.setLevel(getattr(logging, LOG_LEVEL, logging.INFO))

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.DEBUG)

    # Format for logs
    if ENVIRONMENT == "production":
        # JSON-like format for production (easier to parse)
        log_format = "%(asctime)s | %(levelname)-8s | %(name)s | %(funcName)s:%(lineno)d | %(message)s"
        formatter = logging.Formatter(log_format, datefmt="%Y-%m-%d %H:%M:%S")
    else:
        # Colored format for development
        log_format = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
        formatter = ColoredFormatter(log_format)

    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    return logger


# Create default logger instance
logger = setup_logger()


def log_error(error: Exception, context: dict | None = None) -> None:
    """Log an error with optional context.

    Args:
        error: The exception that occurred
        context: Additional context information (user_id, request_id, etc.)
    """
    context_str = ""
    if context:
        context_str = " | " + " | ".join(f"{k}={v}" for k, v in context.items())

    logger.error(f"{type(error).__name__}: {str(error)}{context_str}", exc_info=True)


def log_info(message: str, context: dict | None = None) -> None:
    """Log an info message with optional context.

    Args:
        message: The info message
        context: Additional context information
    """
    context_str = ""
    if context:
        context_str = " | " + " | ".join(f"{k}={v}" for k, v in context.items())

    logger.info(f"{message}{context_str}")


def log_warning(message: str, context: dict | None = None) -> None:
    """Log a warning message with optional context.

    Args:
        message: The warning message
        context: Additional context information
    """
    context_str = ""
    if context:
        context_str = " | " + " | ".join(f"{k}={v}" for k, v in context.items())

    logger.warning(f"{message}{context_str}")


def log_debug(message: str, context: dict | None = None) -> None:
    """Log a debug message with optional context.

    Args:
        message: The debug message
        context: Additional context information
    """
    context_str = ""
    if context:
        context_str = " | " + " | ".join(f"{k}={v}" for k, v in context.items())

    logger.debug(f"{message}{context_str}")
