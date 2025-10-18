import { PrismaClient } from '@prisma/client';
import logger from '../middleware/logger';
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
prisma.$connect()
  .then(() => {
    logger.info('✓ Database connected successfully');
  })
  .catch((error) => {
    logger.error('✗ Database connection failed:', error);
    process.exit(1);
  });
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  logger.info('Database connection closed');
});
export default prisma;
