import { Concurso, Categoria } from '@/types';

export class ContestService {
  // Placeholder methods - will be implemented with Prisma
  async getActiveContests(): Promise<Concurso[]> {
    // TODO: Implement with Prisma
    throw new Error('Not implemented yet');
  }

  async getContestById(_id: number): Promise<Concurso | null> {
    // TODO: Implement with Prisma
    throw new Error('Not implemented yet');
  }

  async createContest(_contestData: Partial<Concurso>): Promise<Concurso> {
    // TODO: Implement with Prisma
    throw new Error('Not implemented yet');
  }

  async updateContest(_id: number, _contestData: Partial<Concurso>): Promise<Concurso> {
    // TODO: Implement with Prisma
    throw new Error('Not implemented yet');
  }

  async deleteContest(_id: number): Promise<void> {
    // TODO: Implement with Prisma
    throw new Error('Not implemented yet');
  }

  async getContestCategories(_contestId: number): Promise<Categoria[]> {
    // TODO: Implement with Prisma
    throw new Error('Not implemented yet');
  }
}

export const contestService = new ContestService();