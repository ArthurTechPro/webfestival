import { Concurso, Categoria } from '@/types';

export class ContestService {
  // Placeholder methods - will be implemented with Prisma
  async getActiveContests(): Promise<Concurso[]> {
    // TODO: Implement with Prisma
    throw new Error('Not implemented yet');
  }

  async getContestById(id: number): Promise<Concurso | null> {
    // TODO: Implement with Prisma
    throw new Error('Not implemented yet');
  }

  async createContest(contestData: Partial<Concurso>): Promise<Concurso> {
    // TODO: Implement with Prisma
    throw new Error('Not implemented yet');
  }

  async updateContest(id: number, contestData: Partial<Concurso>): Promise<Concurso> {
    // TODO: Implement with Prisma
    throw new Error('Not implemented yet');
  }

  async deleteContest(id: number): Promise<void> {
    // TODO: Implement with Prisma
    throw new Error('Not implemented yet');
  }

  async getContestCategories(contestId: number): Promise<Categoria[]> {
    // TODO: Implement with Prisma
    throw new Error('Not implemented yet');
  }
}

export const contestService = new ContestService();