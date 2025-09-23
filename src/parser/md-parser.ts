import { promises as fs } from 'fs';
import { doesFileExist } from '@file-validation/file-validation.js';
import { logger } from '@logger/logger.js';

export async function parseFileShort(
  filePath: string,
): Promise<{ short?: string; hasLong: boolean } | null> {
  let short: string | undefined;
  let longExists = false;

  if (!(await doesFileExist(filePath))) {
    return null;
  }

  try {
    logger.info(`Parsing ${filePath}`);
    const raw = await fs.readFile(filePath, 'utf-8');

    short = raw.match(/#\s*Короткий ответ\s+([\s\S]*?)(?=#|$)/)?.[1]?.trim();
    longExists = /#\s*Длинный ответ/.test(raw);
  } catch (error) {
    logger.error(`Error while parsing ${filePath}: ${error}`);
    return null;
  }

  logger.info(`File ${filePath} parsed successfully`);

  return short ? { short, hasLong: longExists } : { hasLong: longExists };
}

export async function parseFileLong(filePath: string): Promise<string | null> {
  let long: string | undefined;

  if (!(await doesFileExist(filePath))) {
    return null;
  }

  try {
    logger.info(`Parsing ${filePath}`);
    const raw = await fs.readFile(filePath, 'utf-8');

    long = raw.match(/#\s*Длинный ответ\s+([\s\S]*?)(?=#|$)/)?.[1]?.trim();
  } catch (error) {
    logger.error(`Error while parsing ${filePath}: ${error}`);
    return null;
  }

  logger.info(`File ${filePath} parsed successfully`);

  return long || null;
}
