import { Medio } from '@/types';

export class MediaService {
  // Placeholder methods - will be implemented with Prisma and Immich integration
  async uploadMedia(_mediaData: Partial<Medio>): Promise<Medio> {
    // TODO: Implement with Prisma and Immich
    throw new Error('Not implemented yet');
  }

  async getMediaById(_id: number): Promise<Medio | null> {
    // TODO: Implement with Prisma
    throw new Error('Not implemented yet');
  }

  async getMediaByUser(_userId: string): Promise<Medio[]> {
    // TODO: Implement with Prisma
    throw new Error('Not implemented yet');
  }

  async getMediaByContest(_contestId: number): Promise<Medio[]> {
    // TODO: Implement with Prisma
    throw new Error('Not implemented yet');
  }

  async deleteMedia(_id: number): Promise<void> {
    // TODO: Implement with Prisma and Immich cleanup
    throw new Error('Not implemented yet');
  }

  async generateUploadUrl(_userId: string, _contestId: number): Promise<string> {
    // TODO: Implement Immich integration
    throw new Error('Not implemented yet');
  }
}

export const mediaService = new MediaService();