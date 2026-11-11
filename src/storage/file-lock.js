import { mkdir, rm, stat, utimes } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_STALE_MS = 60_000;

/**
 * Serialize mutations from the Harness Host and concurrent profile work. The
 * stale check prevents a crashed process from blocking the plugin forever.
 */
export async function withFileLock(filePath, operation, { timeoutMs = DEFAULT_TIMEOUT_MS, staleMs = DEFAULT_STALE_MS } = {}) {
  if (typeof operation !== 'function') throw new TypeError('file lock operation must be a function');
  const targetPath = resolve(filePath);
  const lockPath = `${targetPath}.lock`;
  await mkdir(dirname(targetPath), { recursive: true });

  const deadline = Date.now() + timeoutMs;
  let acquired = false;
  while (!acquired) {
    try {
      await mkdir(lockPath);
      acquired = true;
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      if (await isStale(lockPath, staleMs)) {
        await rm(lockPath, { recursive: true, force: true });
        continue;
      }
      if (Date.now() >= deadline) {
        const lockError = new Error(`Timed out waiting for file lock: ${targetPath}`);
        lockError.code = 'FILE_LOCK_TIMEOUT';
        throw lockError;
      }
      await delay(Math.min(50, Math.max(5, deadline - Date.now())));
    }
  }

  const heartbeatMs = Math.max(1_000, Math.floor(staleMs / 3));
  const heartbeat = setInterval(() => {
    const now = new Date();
    utimes(lockPath, now, now).catch(() => {});
  }, heartbeatMs);
  heartbeat.unref?.();
  try {
    return await operation();
  } finally {
    clearInterval(heartbeat);
    await rm(lockPath, { recursive: true, force: true });
  }
}

async function isStale(lockPath, staleMs) {
  try {
    const details = await stat(lockPath);
    return Date.now() - details.mtimeMs > staleMs;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

function delay(milliseconds) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));
}
