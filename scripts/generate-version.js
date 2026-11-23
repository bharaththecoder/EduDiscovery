import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const buildId = Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 8);
const versionData = {
  buildId,
  timestamp: new Date().toISOString()
};

fs.writeFileSync(
  path.join(publicDir, 'version.json'),
  JSON.stringify(versionData, null, 2),
  'utf-8'
);

console.log('[version] Generated public/version.json with buildId:', buildId);
