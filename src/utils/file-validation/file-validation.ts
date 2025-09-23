import { promises as fs } from 'fs';
import { logger } from '@/utils/logger/logger.js';

export async function doesFileExist(filePath: string): Promise<boolean> {
  try {
    logger.debug(`Accessing ${filePath}`);
    await fs.access(filePath);
  } catch {
    logger.error(`File ${filePath} not found`);
    return false;
  }

  logger.debug(`File ${filePath} found successfully`);

  return true;
}
