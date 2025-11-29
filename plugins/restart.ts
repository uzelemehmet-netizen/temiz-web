import type { Plugin } from 'vite';
import micromatch from 'micromatch';

export type RestartOptions = { restart?: string[] };

export function restart(options?: RestartOptions): Plugin {
  const patterns = options?.restart ?? [];

  return {
    name: 'dev-restart-plugin',
    configureServer(server) {
      if (!patterns || patterns.length === 0) return;

      // Use the Vite watcher (chokidar) and trigger a full reload when a
      // matching file changes. This mimics the expected behaviour (restart
      // watcher) without killing the process.
      server.watcher.on('change', (filePath) => {
        try {
          if (micromatch.isMatch(filePath, patterns)) {
            server.config.logger.info(
              `[dev-restart-plugin] matched ${filePath} — triggering full reload`
            );
            server.ws.send({ type: 'full-reload' });
          }
        } catch (err) {
          server.config.logger.warn('[dev-restart-plugin] error matching file', err);
        }
      });
    },
  };
}
