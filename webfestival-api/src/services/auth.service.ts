import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AuthTokens, JWTPayload, LoginCredentials, RegisterData } from '@/types';

export class AuthService {
  private readonly JWT_SECRET = process.env['JWT_SECRET']!;
  private readonly JWT_EXPIRES_IN = process.env['JWT_EXPIRES_IN'] || '7d';
  private readonly JWT_REFRESH_SECRET = process.env['JWT_REFRESH_SECRET']!;
  private readonly JWT_REFRESH_EXPIRES_IN = process.env['JWT_REFRESH_EXPIRES_IN'] || '30d';

  generateTokens(payload: Omit<JWTPayload, 'iat' | 'exp'>): AuthTokens {
    const accessToken = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN
    });

    const refreshToken = jwt.sign(payload, this.JWT_REFRESH_SECRET, {
      expiresIn: this.JWT_REFRESH_EXPIRES_IN
    });

    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string): JWTPayload {
    return jwt.verify(token, this.JWT_SECRET) as JWTPayload;
  }

  verifyRefreshToken(token: string): JWTPayload {
    return jwt.verify(token, this.JWT_REFRESH_SECRET) as JWTPayload;
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Placeholder methods - will be implemented with Prisma
  async login(_credentials: LoginCredentials): Promise<AuthTokens> {
    // TODO: Implement with Prisma user lookup
    throw new Error('Not implemented yet');
  }

  async register(_userData: RegisterData): Promise<AuthTokens> {
    // TODO: Implement with Prisma user creation
    throw new Error('Not implemented yet');
  }

  async refreshToken(_refreshToken: string): Promise<AuthTokens> {
    // TODO: Implement token refresh logic
    throw new Error('Not implemented yet');
  }
}

export const authService = new AuthService();