import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function readDirectoryRecursive(dirPath, level = 0) {
  const files = fs.readdirSync(dirPath);
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stats = fs.statSync(fullPath);
    let prefix = ' '.repeat(level * 2); // Añade espacios para la jerarquía
    console.log(prefix + file);
    if (stats.isDirectory()) {
      readDirectoryRecursive(fullPath, level + 1);
    }
  });
}

const rootDir = __dirname; // Usamos __dirname obtenido de import.meta.url
readDirectoryRecursive(rootDir);
