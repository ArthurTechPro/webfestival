import { User } from '@/types';

export class UserService {
  // Placeholder methods - will be implemented with Prisma
  async getUserById(_id: string): Promise<User | null> {
    // TODO: Implement with Prisma
    throw new Error('Not implemented yet');
  }

  async getUserByEmail(_email: string): Promise<User | null> {
    // TODO: Implement with Prisma
    throw new Error('Not implemented yet');
  }

  async createUser(_userData: Partial<User>): Promise<User> {
    // TODO: Implement with Prisma
    throw new Error('Not implemented yet');
  }

  async updateUser(_id: string, _userData: Partial<User>): Promise<User> {
    // TODO: Implement with Prisma
    throw new Error('Not implemented yet');
  }

  async deleteUser(_id: string): Promise<void> {
    // TODO: Implement with Prisma
    throw new Error('Not implemented yet');
  }
}

export const userService = new UserService();