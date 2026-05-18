import { readFile, writeFile } from 'node:fs/promises';

const distIndexPath = new URL('../dist/index.html', import.meta.url);
const singleIndexPath = new URL('../dist-single/index.html', import.meta.url);
const appConfigPath = new URL('../public/app-config.js', import.meta.url);

const singleIndex = await readFile(singleIndexPath, 'utf8');
const appConfig = await readFile(appConfigPath, 'utf8');

const appConfigTag = '    <script src="./app-config.js"></script>';
const inlineAppConfigTag = `    <script>${appConfig}</script>`;

if (!singleIndex.includes(appConfigTag)) {
  throw new Error(`Expected ${singleIndexPath.pathname} to contain ${appConfigTag}`);
}

await writeFile(distIndexPath, singleIndex.replace(appConfigTag, inlineAppConfigTag));
