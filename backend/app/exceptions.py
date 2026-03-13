class AppError(Exception):
    """Base exception for all application domain errors."""

    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class NotFoundError(AppError):
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, 404)


class AuthenticationError(AppError):
    def __init__(self, message: str = "Authentication required"):
        super().__init__(message, 401)


class AuthorizationError(AppError):
    def __init__(self, message: str = "Forbidden"):
        super().__init__(message, 403)


class ValidationError(AppError):
    def __init__(self, message: str):
        super().__init__(message, 400)


class ConflictError(AppError):
    def __init__(self, message: str):
        super().__init__(message, 409)
