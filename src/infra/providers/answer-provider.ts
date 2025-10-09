import { IAnswerProvider } from '@/types/answer-provider.js';
import { MarkdownParser } from '@/core/parser/md-parser.js';

export class ParserQuestionProvider implements IAnswerProvider {
  constructor(private readonly parser: MarkdownParser) {}

  async getLongAnswer(path: string): Promise<string | null> {
    return this.parser.parseLong(path);
  }
}
