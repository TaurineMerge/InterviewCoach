import { Seeder } from 'mongo-seeding';
import { faker } from '@faker-js/faker';
import { logger } from '../../src/utils/logger/logger.ts';
import 'dotenv/config';

const ProgressStatus = {
  KNOW: 'KNOW',
  DONT_KNOW: 'DONT_KNOW',
} as const;

type ProgressStatus = (typeof ProgressStatus)[keyof typeof ProgressStatus];

interface Progress {
  userId: number;
  questionPath: string;
  status: ProgressStatus;
  createdAt: Date;
}

class MongoSeeder {
  private config: object;
  private seeder: Seeder;
  constructor() {
    this.config = {
      database: `${process.env.DB_URI || ''}/${process.env.DB_NAME || ''}`,
      dropDatabase: true,
      dropCollections: true,
    };
    this.seeder = new Seeder(this.config);
  }

  async generateData() {
    logger.debug('Generating fake data...');

    const progress = this.generateProgress();

    return {
      progress,
    };
  }
  generateProgress() {
    const generatedProgress: Progress[] = [];

    for (let i = 0; i < 50; i++) {
      generatedProgress.push({
        userId: faker.number.int({ min: 1, max: 999999999999 }),
        questionPath: faker.system.filePath(),
        status: faker.helpers.enumValue(ProgressStatus),
        createdAt: new Date(),
      });
    }

    return generatedProgress;
  }

  async seed() {
    try {
      logger.debug('Starting seeding with mongo-seeding library...');

      const collections = await this.generateData();

      const collectionsConfig = [
        {
          name: 'progress',
          documents: collections.progress,
        },
      ];

      await this.seeder.import(collectionsConfig);
      logger.debug('Seeding completed successfully!');

      return collections;
    } catch (error) {
      logger.error('Seeding failed:', error);
      throw error;
    }
  }
}

async function seedMongoDb() {
  const seeder = new MongoSeeder();
  await seeder.seed();
}

await seedMongoDb();
