// src/main.ts
import TelegramBot from 'node-telegram-bot-api';
import 'dotenv/config';

// CONFIG
import {
  closeDatabase,
  connectDatabase,
} from '@/config/database/database-config.js';
import {
  connectSession,
  closeSession,
} from '@/config/session/session-config.js';

// INFRASTRUCTURE
import { MongoProgressRepository } from '@/infra/repositories/progress-repository.js';
import { RedisSessionRepository } from '@/infra/repositories/session-repository.js';

// CORE LAYER
import { TreeBuilder } from '@/core/parser/tree-builder.js';
import { MarkdownFileParser } from '@/core/parser/md-parser.js';

// APPLICATION LAYER
import { ProgressService } from '@/application/progress/progress-service.js';
import { SessionManager } from '@/application/session/session-manager.js';
import { QuestionFlowService } from '@/application/question/question-flow-service.js';
import { ChecklistService } from '@/application/checklist/checklist-service.js';
import { SessionOrchestrator } from '@/application/session/session-orchestrator.js';
import { ClientContext } from '@/application/session/session-context.js';
import { BotClient } from '@/application/client/bot-client.js';
import { BotService } from '@/application/bot-service.js';

// PRESENTATION LAYER
import { BotController } from '@/bot/bot-controller.js';

// SESSION MANAGEMENT
import { BotSessionRegistry } from '@/application/client/bot-session-registry.js';
import { IBotClientFactory } from '@/types/bot-client-factory.js';

// LOGGING
import { logger } from '@/utils/logger/logger.js';

async function main() {
  try {
    // Infrastructure initialization
    const mongo = await connectDatabase();
    const redis = await connectSession();
    gracefulShutdown();

    const progressRepo = new MongoProgressRepository(mongo);
    const sessionRepo = new RedisSessionRepository(redis);

    // Build the question tree (domain data)
    const parser = new MarkdownFileParser();
    const treeBuilder = new TreeBuilder(parser);
    const fsTree = await treeBuilder.buildTree(process.env.QUESTIONS_ROOT_DIR!);

    // Application layer
    const progressService = new ProgressService(progressRepo);
    const sessionManager = new SessionManager(sessionRepo);
    const checklistService = new ChecklistService();
    const questionFlowService = new QuestionFlowService(progressService);
    const sessionOrchestrator = new SessionOrchestrator(sessionManager);

    const clientFactory: IBotClientFactory = {
      createClient(userId: number) {
        const context = new ClientContext(userId, fsTree);
        return new BotClient(
          context,
          sessionOrchestrator,
          checklistService,
          questionFlowService,
        );
      },
    };

    const clientRegistry = new BotSessionRegistry(clientFactory);

    // Presentation: Telegram bot + controller
    const bot = new TelegramBot(process.env.TG_BOT_TOKEN!, { polling: true });

    const controller = new BotController(bot, {
      getServiceForChat(chatId: number) {
        const client = clientRegistry.getOrCreate(chatId);
        return new BotService(client);
      },
    });

    controller.start();
    logger.info('🤖 Bot launched successfully.');
  } catch (error) {
    logger.error(`❌ Failed to start bot: ${error}`);
    process.exit(1);
  }
}

// Graceful shutdown — closing DB + Session
function gracefulShutdown() {
  process.on('SIGINT', async () => {
    logger.info('🛑 Shutting down gracefully...');
    await Promise.allSettled([closeDatabase(), closeSession()]);
    process.exit(0);
  });
}

main();
