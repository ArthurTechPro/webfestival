import { User } from '@/types';

export class UserService {
  // Placeholder methods - will be implemented with Prisma
  async getUserById(id: string): Promise<User | null> {
    // TODO: Implement with Prisma
    throw new Error('Not implemented yet');
  }

  async getUserByEmail(email: string): Promise<User | null> {
    // TODO: Implement with Prisma
    throw new Error('Not implemented yet');
  }

  async createUser(userData: Partial<User>): Promise<User> {
    // TODO: Implement with Prisma
    throw new Error('Not implemented yet');
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    // TODO: Implement with Prisma
    throw new Error('Not implemented yet');
  }

  async deleteUser(id: string): Promise<void> {
    // TODO: Implement with Prisma
    throw new Error('Not implemented yet');
  }
}

export const userService = new UserService();