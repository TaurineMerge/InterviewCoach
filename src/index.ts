import { initBot } from './bot/initBot';
import { runBot } from './bot/runBot';
import { BotClient } from '@/services/bot-client';
import { buildTree } from '@parser/tree-builder';
import 'dotenv/config';
import { QuestionSelector } from '@/services/question-selector';
import { ProgressService } from '@/services/progress-service';
import { MongoProgressRepository } from './infra/progress-repository';
import { SessionManager } from '@/services/session-manager';
import { RedisSessionStore } from './infra/session-repository';
import { getDatabase } from '@/config/database/database-config';

async function main() {
  const fsTree = await buildTree(process.env.QUESTIONS_ROOT_DIR || '');

  const db = getDatabase();

  const progressRepository = new MongoProgressRepository(db);
  const sessionRepository = new RedisSessionStore();

  const progressService = new ProgressService(progressRepository);
  const questionSelector = new QuestionSelector(progressService);
  const sessionManager = new SessionManager(sessionRepository);

  const bot = initBot(process.env.TG_BOT_TOKEN || '');
  const botClient = new BotClient(sessionManager, questionSelector, fsTree);
  runBot(bot, botClient, fsTree);
}

main();
