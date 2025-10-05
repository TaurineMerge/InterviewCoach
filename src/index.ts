import { initBot } from './bot/initBot.js';
import { runBot } from './bot/runBot.js';
import { buildTree } from '@parser/tree-builder.js';
import 'dotenv/config';
import { QuestionSelector } from '@/services/question-selector.js';
import { ProgressService } from '@/services/progress-service.js';
import { MongoProgressRepository } from './infra/progress-repository.js';
import { SessionManager } from '@/services/session-manager.js';
import { RedisSessionStore } from './infra/session-repository.js';
import {
  getDatabase,
  closeDatabase,
} from '@/config/database/database-config.js';
import {
  connectSession,
  closeSession,
} from './config/session/session-config.js';
import { BotSessionRegistry } from '@/services/bot-session-registry.js';

async function main() {
  const fsTree = await buildTree(process.env.QUESTIONS_ROOT_DIR || '');

  const db = getDatabase();
  const session = await connectSession();

  const progressRepository = new MongoProgressRepository(db);
  const sessionRepository = new RedisSessionStore(session);

  const progressService = new ProgressService(progressRepository);
  const questionSelector = new QuestionSelector(progressService);
  const sessionManager = new SessionManager(sessionRepository);

  const bot = initBot(process.env.TG_BOT_TOKEN || '');
  const botSessionRegistry = new BotSessionRegistry(
    sessionManager,
    questionSelector,
    fsTree,
  );
  runBot(bot, botSessionRegistry, fsTree);

  process.on('SIGINT', async () => {
    await closeSession();
    await closeDatabase();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await closeSession();
    await closeDatabase();
    process.exit(0);
  });
}

main();
