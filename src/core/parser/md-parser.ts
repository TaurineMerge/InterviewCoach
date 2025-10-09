import { promises as fs } from 'fs';
import { doesFileExist } from '@/utils/file-validation/file-validation.js';
import { logger } from '@/utils/logger/logger.js';

export interface MarkdownParser {
  parseShort(
    filePath: string,
  ): Promise<{ short?: string; hasLong: boolean } | null>;
  parseLong(filePath: string): Promise<string | null>;
}

export class MarkdownFileParser implements MarkdownParser {
  private async parseFile(filePath: string): Promise<string | null> {
    if (!(await doesFileExist(filePath))) {
      return null;
    }

    try {
      logger.debug(`Parsing ${filePath}`);
      const raw = await fs.readFile(filePath, 'utf-8');

      logger.debug(`File ${filePath} parsed successfully`);

      return raw;
    } catch (error) {
      logger.error(`Error while parsing ${filePath}: ${error}`);
      return null;
    }
  }

  async parseShort(
    filePath: string,
  ): Promise<{ short?: string; hasLong: boolean } | null> {
    let longExists: boolean = false;

    if (!(await doesFileExist(filePath))) {
      return null;
    }

    const raw = await this.parseFile(filePath);

    if (!raw) {
      return null;
    }

    const short: string | undefined = raw
      .match(/#\s*Короткий ответ\s+([\s\S]*?)(?=#|$)/)?.[1]
      ?.trim();
    longExists = /#\s*Длинный ответ/.test(raw);

    return short ? { short, hasLong: longExists } : { hasLong: longExists };
  }

  async parseLong(filePath: string): Promise<string | null> {
    if (!(await doesFileExist(filePath))) {
      return null;
    }

    const raw = await this.parseFile(filePath);

    if (!raw) {
      return null;
    }

    const long: string | undefined = raw
      .match(/#\s*Длинный ответ\s+([\s\S]*?)(?=#|$)/)?.[1]
      ?.trim();

    return long || null;
  }
}
