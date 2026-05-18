import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { encodeDistFiles } from './encode-dist.mjs';

test('encodes dist index and app config as UTF-8 base64 text files', async () => {
  const root = await mkdtemp(join(tmpdir(), 'encode-dist-test-'));
  const distDir = join(root, 'dist');
  const encodedDir = join(root, 'dist-encoded');
  await mkdir(distDir);
  await writeFile(join(distDir, 'index.html'), '<h1>横須賀</h1>', 'utf8');
  await writeFile(join(distDir, 'app-config.js'), 'window.x = "設定";', 'utf8');

  await encodeDistFiles({ distDir, encodedDir });

  const encodedIndex = await readFile(join(encodedDir, 'index.encoded.txt'), 'utf8');
  const encodedConfig = await readFile(join(encodedDir, 'app-config.encoded.txt'), 'utf8');

  assert.equal(Buffer.from(encodedIndex, 'base64').toString('utf8'), '<h1>横須賀</h1>');
  assert.equal(Buffer.from(encodedConfig, 'base64').toString('utf8'), 'window.x = "設定";');
});
