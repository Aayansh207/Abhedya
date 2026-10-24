// core/errors.js
// Custom error classes for Abhedya core engine

export class AbhedyaError extends Error {
  constructor(message, code = "ABHEDYA_ERROR") {
    super(message);
    this.name = "AbhedyaError";
    this.code = code;
  }
}

export class ImageValidationError extends AbhedyaError {
  constructor(message) {
    super(message, "IMAGE_VALIDATION_ERROR");
    this.name = "ImageValidationError";
  }
}

export class CapacityExceededError extends AbhedyaError {
  constructor(requiredBytes, availableBytes) {
    super(
      `Message payload exceeds image capacity: requires ${requiredBytes} bytes, but only ${availableBytes} bytes are available`,
      "CAPACITY_EXCEEDED"
    );
    this.name = "CapacityExceededError";
    this.requiredBytes = requiredBytes;
    this.availableBytes = availableBytes;
  }
}

export class AuthenticationError extends AbhedyaError {
  constructor(message = "Authentication failed: invalid password or corrupted payload") {
    super(message, "AUTHENTICATION_FAILED");
    this.name = "AuthenticationError";
  }
}

export class InvalidPayloadError extends AbhedyaError {
  constructor(message = "Invalid or corrupted binary payload") {
    super(message, "INVALID_PAYLOAD");
    this.name = "InvalidPayloadError";
  }
}

export const USER_FACING_REVEAL_ERROR =
  "Failed to reveal message. The image may not contain a hidden message, the payload may be corrupted, or the password was incorrect.";

/**
 * Returns a standardized, non-revealing user-facing error message
 * to protect against side-channel analysis and information disclosure.
 */
export function toUserFacingError(_err) {
  return USER_FACING_REVEAL_ERROR;
}
