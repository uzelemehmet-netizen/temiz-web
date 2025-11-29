import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Hono } from 'hono';
import type { Handler } from 'hono/types';
// Use explicit .js import so the server-side loader can resolve this file in
// both Node and Vite dev servers.
import updatedFetch from '../src/__create/fetch.js';

const API_BASENAME = '/api';
const api = new Hono();

// Resolve candidate directories for API route files. We try these in order:
// 1) build/server/src/app/api (server build copy)
// 2) src/app/api next to this module
// 3) src/app/api under the current working directory (and walking upwards)
const fileDir = join(fileURLToPath(new URL('.', import.meta.url)), '..');
let __dirname = join(fileDir, 'src/app/api');

import { access } from 'node:fs/promises';

async function resolveApiDir(): Promise<string | null> {
  const candidates = [
    join(fileDir, 'build/server/src/app/api'),
    join(fileDir, 'src/app/api'),
    join(process.cwd(), 'src/app/api'),
  ];

  // Walk up from CWD and add any src/app/api along the way
  try {
    let cur = process.cwd();
    const { dirname } = await import('node:path');
    while (true) {
      const candidate = join(cur, 'src/app/api');
      if (!candidates.includes(candidate)) candidates.push(candidate);
      const parent = dirname(cur);
      if (parent === cur) break;
      cur = parent;
    }
  } catch (_e) {
    // ignore
  }

  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch (_err) {
      // try next candidate
    }
  }

  return null;
}

const resolved = await resolveApiDir();
if (resolved) {
  __dirname = resolved;
} else {
  console.warn('route-builder: could not find src/app/api under build/server or project src — continuing; route discovery may produce no routes.');
}

if (globalThis.fetch) {
  globalThis.fetch = updatedFetch;
}

// Recursively find all route.js files
async function findRouteFiles(dir: string): Promise<string[]> {
  // If the directory doesn't exist, return an empty list rather than throwing
  let files: string[];
  try {
    files = await readdir(dir);
  } catch (err: any) {
    if (err && err.code === 'ENOENT') {
      return [];
    }
    throw err;
  }

  let routes: string[] = [];

  for (const file of files) {
    try {
      const filePath = join(dir, file);
      const statResult = await stat(filePath);

      if (statResult.isDirectory()) {
        routes = routes.concat(await findRouteFiles(filePath));
      } else if (file === 'route.js') {
        // Handle root route.js specially
        if (filePath === join(__dirname, 'route.js')) {
          routes.unshift(filePath); // Add to beginning of array
        } else {
          routes.push(filePath);
        }
      }
    } catch (error) {
      console.error(`Error reading file ${file}:`, error);
    }
  }

  return routes;
}

// Helper function to transform file path to Hono route path
function getHonoPath(routeFile: string): { name: string; pattern: string }[] {
  const relativePath = routeFile.replace(__dirname, '');
  const parts = relativePath.split('/').filter(Boolean);
  const routeParts = parts.slice(0, -1); // Remove 'route.js'
  if (routeParts.length === 0) {
    return [{ name: 'root', pattern: '' }];
  }
  const transformedParts = routeParts.map((segment) => {
    const match = segment.match(/^\[(\.{3})?([^\]]+)\]$/);
    if (match) {
      const [_, dots, param] = match;
      return dots === '...'
        ? { name: param, pattern: `:${param}{.+}` }
        : { name: param, pattern: `:${param}` };
    }
    return { name: segment, pattern: segment };
  });
  return transformedParts;
}

// Import and register all routes
async function registerRoutes() {
  // During production server builds we prefer to use server-side copies
  // of route modules (build/server/...). If we only found the source
  // `src/app/api` location, importing those modules at build-time can
  // fail because of path aliases (e.g. '@/app'). In that case skip
  // registering routes during build so the server bundle can be
  // produced without attempting to import source-only modules.
  if (
    process.env.NODE_ENV === 'production' &&
    __dirname.includes('/src/app/api') &&
    !__dirname.includes('/build/server')
  ) {
    console.warn('route-builder: production build uses source api files; skipping route imports to avoid import-time resolution errors.');
    return;
  }
  const routeFiles = (
    await findRouteFiles(__dirname).catch((error) => {
      console.error('Error finding route files:', error);
      return [];
    })
  )
    .slice()
    .sort((a, b) => {
      return b.length - a.length;
    });

  // Clear existing routes
  api.routes = [];

  for (const routeFile of routeFiles) {
    try {
      const route = await import(/* @vite-ignore */ `${routeFile}?update=${Date.now()}`);

      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
      for (const method of methods) {
        try {
          if (route[method]) {
            const parts = getHonoPath(routeFile);
            const honoPath = `/${parts.map(({ pattern }) => pattern).join('/')}`;
            const handler: Handler = async (c) => {
              const params = c.req.param();
              if (import.meta.env.DEV) {
                const updatedRoute = await import(
                  /* @vite-ignore */ `${routeFile}?update=${Date.now()}`
                );
                return await updatedRoute[method](c.req.raw, { params });
              }
              return await route[method](c.req.raw, { params });
            };
            const methodLowercase = method.toLowerCase();
            switch (methodLowercase) {
              case 'get':
                api.get(honoPath, handler);
                break;
              case 'post':
                api.post(honoPath, handler);
                break;
              case 'put':
                api.put(honoPath, handler);
                break;
              case 'delete':
                api.delete(honoPath, handler);
                break;
              case 'patch':
                api.patch(honoPath, handler);
                break;
              default:
                console.warn(`Unsupported method: ${method}`);
                break;
            }
          }
        } catch (error) {
          console.error(`Error registering route ${routeFile} for method ${method}:`, error);
        }
      }
    } catch (error) {
      console.error(`Error importing route file ${routeFile}:`, error);
    }
  }
}

// Initial route registration
await registerRoutes();

// Hot reload routes in development
if (import.meta.env.DEV) {
  import.meta.glob('../src/app/api/**/route.js', {
    eager: true,
  });
  if (import.meta.hot) {
    import.meta.hot.accept((newSelf) => {
      registerRoutes().catch((err) => {
        console.error('Error reloading routes:', err);
      });
    });
  }
}

export { api, API_BASENAME };
