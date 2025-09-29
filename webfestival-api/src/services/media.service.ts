import { Medio } from '@/types';

export class MediaService {
  // Placeholder methods - will be implemented with Prisma and Immich integration
  async uploadMedia(mediaData: Partial<Medio>): Promise<Medio> {
    // TODO: Implement with Prisma and Immich
    throw new Error('Not implemented yet');
  }

  async getMediaById(id: number): Promise<Medio | null> {
    // TODO: Implement with Prisma
    throw new Error('Not implemented yet');
  }

  async getMediaByUser(userId: string): Promise<Medio[]> {
    // TODO: Implement with Prisma
    throw new Error('Not implemented yet');
  }

  async getMediaByContest(contestId: number): Promise<Medio[]> {
    // TODO: Implement with Prisma
    throw new Error('Not implemented yet');
  }

  async deleteMedia(id: number): Promise<void> {
    // TODO: Implement with Prisma and Immich cleanup
    throw new Error('Not implemented yet');
  }

  async generateUploadUrl(userId: string, contestId: number): Promise<string> {
    // TODO: Implement Immich integration
    throw new Error('Not implemented yet');
  }
}

export const mediaService = new MediaService();