import sharp from 'sharp';
import { rename, unlink } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets');

async function replacePng(path, pipeline) {
  const tmp = `${path}.tmp`;
  await pipeline.toFile(tmp);
  await unlink(path).catch(() => {});
  await rename(tmp, path);
}

async function writeIcon(name, size) {
  const path = join(root, name);
  await replacePng(
    path,
    sharp(path)
      .resize(size, size, { fit: 'contain', background: '#8E2DE2' })
      .png({ compressionLevel: 9, quality: 80 }),
  );
  console.log('OK', name, size);
}

async function writeSplash() {
  const path = join(root, 'splash.png');
  await replacePng(
    path,
    sharp(path)
      .resize(1284, 2778, { fit: 'inside', withoutEnlargement: true })
      .png({ compressionLevel: 9, quality: 75 }),
  );
  console.log('OK splash.png');
}

await writeIcon('icon.png', 1024);
await writeIcon('adaptive-icon.png', 1024);
await writeSplash();
