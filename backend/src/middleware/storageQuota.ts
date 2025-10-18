import fs from 'fs/promises';
import path from 'path';
import logger from './logger';
const MAX_STORAGE_MB = parseInt(process.env.MAX_STORAGE_MB || '1000');
const MAX_STORAGE_BYTES = MAX_STORAGE_MB * 1024 * 1024;
const CLEANUP_THRESHOLD = 0.9;
const CLEANUP_PERCENTAGE = 0.2;
interface FileInfo {
  file: string;
  path: string;
  mtime: Date;
  size: number;
}
export async function checkStorageQuota(uploadDir: string): Promise<boolean> {
  try {
    const files = await fs.readdir(uploadDir);
    let totalSize = 0;
    for (const file of files) {
      try {
        const filePath = path.join(uploadDir, file);
        const stats = await fs.stat(filePath);
        if (stats.isFile()) {
          totalSize += stats.size;
        }
      } catch (error) {
        logger.warn(`Failed to stat file ${file}:`, error);
        continue;
      }
    }
    const usedMB = totalSize / 1024 / 1024;
    const usedPercentage = (totalSize / MAX_STORAGE_BYTES) * 100;
    logger.info(
      `Storage usage: ${usedMB.toFixed(2)}MB / ${MAX_STORAGE_MB}MB (${usedPercentage.toFixed(1)}%)`
    );
    if (totalSize > MAX_STORAGE_BYTES * CLEANUP_THRESHOLD) {
      logger.warn(
        `Storage threshold exceeded (${usedPercentage.toFixed(1)}%). Initiating cleanup...`
      );
      await cleanOldFiles(uploadDir, files);
    }
    if (totalSize > MAX_STORAGE_BYTES) {
      logger.error('Storage quota exceeded! Upload rejected.');
      return false;
    }
    return true;
  } catch (error) {
    logger.error('Storage quota check failed:', error);
    return true;
  }
}
async function cleanOldFiles(uploadDir: string, existingFiles?: string[]): Promise<void> {
  try {
    const files = existingFiles || (await fs.readdir(uploadDir));
    const filesWithStats: FileInfo[] = [];
    for (const file of files) {
      try {
        const filePath = path.join(uploadDir, file);
        const stats = await fs.stat(filePath);
        if (stats.isFile()) {
          filesWithStats.push({
            file,
            path: filePath,
            mtime: stats.mtime,
            size: stats.size,
          });
        }
      } catch (error) {
        logger.warn(`Failed to stat file ${file}:`, error);
        continue;
      }
    }
    if (filesWithStats.length === 0) {
      logger.info('No files to clean');
      return;
    }
    filesWithStats.sort((a, b) => a.mtime.getTime() - b.mtime.getTime());
    const deleteCount = Math.max(1, Math.floor(filesWithStats.length * CLEANUP_PERCENTAGE));
    let deletedSize = 0;
    let deletedCount = 0;
    logger.info(`Cleaning ${deleteCount} oldest files...`);
    for (let i = 0; i < deleteCount && i < filesWithStats.length; i++) {
      try {
        await fs.unlink(filesWithStats[i].path);
        deletedSize += filesWithStats[i].size;
        deletedCount++;
        logger.debug(`Deleted: ${filesWithStats[i].file}`);
      } catch (error) {
        logger.error(`Failed to delete file ${filesWithStats[i].file}:`, error);
      }
    }
    const freedMB = deletedSize / 1024 / 1024;
    logger.info(`Cleanup complete: Deleted ${deletedCount} files, freed ${freedMB.toFixed(2)}MB`);
  } catch (error) {
    logger.error('Failed to clean old files:', error);
    throw error;
  }
}
export async function getStorageStats(uploadDir: string): Promise<{
  totalSizeMB: number;
  totalFiles: number;
  quotaMB: number;
  usedPercentage: number;
  availableMB: number;
}> {
  try {
    const files = await fs.readdir(uploadDir);
    let totalSize = 0;
    let fileCount = 0;
    for (const file of files) {
      try {
        const filePath = path.join(uploadDir, file);
        const stats = await fs.stat(filePath);
        if (stats.isFile()) {
          totalSize += stats.size;
          fileCount++;
        }
      } catch (error) {
        continue;
      }
    }
    const totalSizeMB = totalSize / 1024 / 1024;
    const usedPercentage = (totalSize / MAX_STORAGE_BYTES) * 100;
    const availableMB = (MAX_STORAGE_BYTES - totalSize) / 1024 / 1024;
    return {
      totalSizeMB,
      totalFiles: fileCount,
      quotaMB: MAX_STORAGE_MB,
      usedPercentage,
      availableMB: Math.max(0, availableMB),
    };
  } catch (error) {
    logger.error('Failed to get storage stats:', error);
    throw error;
  }
}
export default {
  checkStorageQuota,
  getStorageStats,
  cleanOldFiles,
};
