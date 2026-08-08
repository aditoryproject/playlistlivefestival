import fs from 'fs';
import path from 'path';

/**
 * Get canonical public/uploads directory path across standard and standalone deployments
 */
export function getUploadsDir(): string {
  const rootDir = /*turbopackIgnore: true*/ process.cwd();
  const primaryDir = path.join(rootDir, 'public', 'uploads');
  
  if (!fs.existsSync(primaryDir)) {
    try {
      fs.mkdirSync(primaryDir, { recursive: true });
    } catch (e) {
      console.error('Failed to create primary upload dir:', e);
    }
  }

  // Also handle standalone mode where process.cwd() might be inside .next
  if (rootDir.includes('.next')) {
    const parentPublicUploads = path.resolve(rootDir, '..', 'public', 'uploads');
    if (!fs.existsSync(parentPublicUploads)) {
      try {
        fs.mkdirSync(parentPublicUploads, { recursive: true });
      } catch (e) {
        // Ignore if parent dir is not accessible
      }
    }
  }

  return primaryDir;
}

/**
 * Find file across primary and fallback upload directories
 */
export function findUploadedFile(safeFilename: string): string | null {
  const rootDir = /*turbopackIgnore: true*/ process.cwd();
  const candidateDirs = [
    path.join(rootDir, 'public', 'uploads'),
    path.resolve(rootDir, '..', 'public', 'uploads'),
  ];

  for (const dir of candidateDirs) {
    const fullPath = path.join(dir, safeFilename);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }

  return null;
}
