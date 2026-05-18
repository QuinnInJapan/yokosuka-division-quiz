import { mkdir, readFile, writeFile } from 'node:fs/promises';

const repoRoot = new URL('..', import.meta.url);

const FILES = [
  ['index.html', 'index.encoded.txt'],
  ['app-config.js', 'app-config.encoded.txt'],
];

export async function encodeDistFiles({
  distDir = new URL('dist/', repoRoot),
  encodedDir = new URL('dist-encoded/', repoRoot),
} = {}) {
  await mkdir(encodedDir, { recursive: true });

  await Promise.all(FILES.map(async ([sourceName, outputName]) => {
    const source = new URL(sourceName, directoryUrl(distDir));
    const output = new URL(outputName, directoryUrl(encodedDir));
    const content = await readFile(source);
    await writeFile(output, content.toString('base64'), 'utf8');
  }));
}

function directoryUrl(value) {
  if (value instanceof URL) return value;
  return new URL(`${value.replace(/\/?$/, '/')}`, 'file:');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await encodeDistFiles();
}
