import jwt from "jsonwebtoken";

export interface JWTPayload {
  sub: string;
  [key: string]: any;
}

export class JWTError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JWTError";
  }
}

/**
 * Extracts user ID from JWT token
 * @param token - JWT token string
 * @returns User ID from the 'sub' field
 * @throws JWTError if token is invalid or doesn't contain 'sub'
 */
export function extractUserIdFromToken(token: string): string {
  try {
    // Remove 'Bearer ' prefix if present
    const cleanToken = token.replace(/^Bearer\s+/, "");

    // Decode token without verification (since we only need to extract the payload)
    // In production, you might want to verify the token with a secret
    const decoded = jwt.decode(cleanToken) as JWTPayload;

    if (!decoded || typeof decoded !== "object") {
      throw new JWTError("Invalid token format");
    }

    if (!decoded.sub) {
      throw new JWTError("Token does not contain user ID (sub field)");
    }

    return decoded.sub;
  } catch (error) {
    if (error instanceof JWTError) {
      throw error;
    }
    throw new JWTError(
      `Failed to parse token: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Extracts user ID from Authorization header
 * @param authHeader - Authorization header value
 * @returns User ID from the JWT token
 * @throws JWTError if header is invalid or token parsing fails
 */
export function extractUserIdFromAuthHeader(
  authHeader: string | undefined,
): string {
  if (!authHeader) {
    throw new JWTError("Authorization header is missing");
  }

  return extractUserIdFromToken(authHeader);
}
