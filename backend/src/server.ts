import app from './app';
import logger from './middleware/logger';
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info('='.repeat(70));
  logger.info('🚀 AgroAI Assistant Backend Server');
  logger.info('='.repeat(70));
  logger.info(`📡 Server running on port ${PORT}`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 API URL: http://localhost:${PORT}`);
  logger.info(`🐍 Python ML Service: ${process.env.PYTHON_API_URL || 'http://127.0.0.1:8000'}`);
  logger.info('='.repeat(70));
  logger.info('\n📚 Available Endpoints:');
  logger.info('  POST /api/crop          - Crop Recommendation');
  logger.info('  POST /api/disease       - Disease Detection');
  logger.info('  POST /api/fertilizer    - Fertilizer Suggestion');
  logger.info('  POST /api/yield         - Yield Prediction');
  logger.info('  GET  /health            - Health Check');
  logger.info('='.repeat(70) + '\n');
});
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});
process.on('SIGINT', () => {
  logger.info('\nSIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});
export default server;
