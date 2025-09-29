import { Collection, Db } from 'mongodb';
import {
  ProgressStatus,
  ProgressRepository,
} from '@models/progress-repository.js';
import { logger } from '@/utils/logger/logger.js';

export class MongoProgressRepository implements ProgressRepository {
  private collection: Collection;

  constructor(db: Db) {
    this.collection = db.collection('progress');
  }

  async setQuestionStatus(
    userId: number,
    path: string,
    status: ProgressStatus,
  ): Promise<void> {
    logger.debug(
      `ProgressRepository > Setting progress for user "${userId}" and question "${path}" to "${status}"`,
    );
    try {
      await this.collection.updateOne(
        { userId, questionPath: path },
        { $set: { status, updatedAt: new Date() } },
        { upsert: true },
      );
      logger.debug(
        `ProgressRepository > Progress for user "${userId}" and question "${path}" set to "${status}"`,
      );
    } catch (e) {
      logger.error(
        `ProgressRepository > Error setting progress for user "${userId}" and question "${path}" to "${status}": ${e}`,
      );
      throw e;
    }
  }

  async getQuestionStatus(
    userId: number,
    path: string,
  ): Promise<ProgressStatus | null> {
    logger.debug(
      `ProgressRepository > Getting progress for user "${userId}" and question "${path}"`,
    );
    let doc;
    try {
      doc = await this.collection.findOne({ userId, questionPath: path });
    } catch (e) {
      logger.error(
        `ProgressRepository > Error getting progress for user "${userId}" and question "${path}": ${e}`,
      );
      throw e;
    }
    return doc?.status ?? null;
  }

  async resetUserProgress(userId: number) {
    logger.debug(
      `ProgressRepository > Resetting progress for user "${userId}"`,
    );
    try {
      await this.collection.deleteMany({ userId });
      logger.debug(
        `ProgressRepository > Progress for user "${userId}" reset successfully`,
      );
    } catch (e) {
      logger.error(
        `ProgressRepository > Error resetting progress for user "${userId}": ${e}`,
      );
      throw e;
    }
  }

  async getStats(userId: number): Promise<{ know: number; dontKnow: number }> {
    logger.debug(`ProgressRepository > Getting stats for user "${userId}"`);
    try {
      const pipeline = [
        { $match: { userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ];
      const result = await this.collection.aggregate(pipeline).toArray();
      const stats = { know: 0, dontKnow: 0 };
      for (const r of result) {
        if (r._id === 'know') stats.know = r.count;
        else if (r._id === 'dont_know') stats.dontKnow = r.count;
      }
      logger.debug(
        `ProgressRepository > Stats for user "${userId}" were fetched successfully`,
      );
      return stats;
    } catch (e) {
      logger.error(
        `ProgressRepository > Error getting stats for user "${userId}": ${e}`,
      );
      throw e;
    }
  }

  async getAll(userId: number): Promise<Record<string, ProgressStatus>> {
    logger.debug(
      `ProgressRepository > Getting all progress for user "${userId}"`,
    );
    try {
      const docs = await this.collection.find({ userId }).toArray();
      const map: Record<string, ProgressStatus> = {};
      for (const doc of docs) {
        map[doc.questionPath] = doc.status;
      }
      logger.debug(
        `ProgressRepository > All progress for user "${userId}" were fetched successfully`,
      );
      return map;
    } catch (e) {
      logger.error(
        `ProgressRepository > Error getting all progress for user "${userId}": ${e}`,
      );
      throw e;
    }
  }
}
