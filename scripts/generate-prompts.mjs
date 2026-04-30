#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DATA = JSON.parse(
  readFileSync(join(__dirname, "archetype-outfits.json"), "utf8"),
);
const OUT_DIR = join(ROOT, "prompts");
mkdirSync(OUT_DIR, { recursive: true });

const SPEC = {
  format: "PNG",
  background: "fully transparent (alpha channel)",
  canvas: "1024 x 1024 pixels, square",
  characterSize: "Sukarin occupies roughly 80% of canvas height, centered",
  pose: "Pose must clearly differ from the reference. The reference has both stubby hands clasped together at the chest holding a heart — do not replicate that. Pick a distinct, expressive pose that fits the archetype. Vary across archetypes.",
  characterFeel:
    "Match Sukarin's mascot style from the reference: soft, rounded, plush, kawaii, chibi, pastel, child-friendly. Outfits should feel like part of the same character art, not tactical or hyper-realistic. Adapt every garment to Sukarin's chibi proportions.",
  lineWork:
    "All outfit and accessory lines must use the same thick, rounded stroke weight as Sukarin's body outline. No thin interior detail lines. Use large, simple, rounded shapes — no fine seams, tiny buttons, thin straps, or detailed stitching. If the outfit description sounds detailed, simplify it into a few chunky mascot shapes.",
  noText:
    "No text, letters, numbers, kanji, kana, logos, or written symbols anywhere in the image.",
  lowerBody:
    "Sukarin's lower body must remain bare and identical to the reference. No pants, shorts, skirts, jumpsuits, socks, shoes, or footwear. Upper garments may be any length but must not transition into pants or footwear; any visible legs/feet stay bare.",
};

const buildPrompt = ({ code, name, outfit }) => `# ${code} — ${name}

Use the attached reference image of **Sukarin** as the character base. Generate Sukarin wearing the outfit below, preserving the exact character design, color palette, and art style of the reference. Only the outfit changes.

## Output specs

- File format: ${SPEC.format}
- Background: ${SPEC.background}
- Canvas: ${SPEC.canvas}
- Character size: ${SPEC.characterSize}
- Pose: ${SPEC.pose}
- Character feel: ${SPEC.characterFeel}
- Line work: ${SPEC.lineWork}
- No text: ${SPEC.noText}
- Lower body: ${SPEC.lowerBody}

## Outfit (${code} — ${name})

${outfit}

## Filename

Save as: \`${code}.png\`
`;

const indexLines = ["# Archetype image prompts", "", `Total: ${DATA.length}`, ""];
indexLines.push("## Global specs");
indexLines.push("");
for (const [k, v] of Object.entries(SPEC)) indexLines.push(`- **${k}**: ${v}`);
indexLines.push("", "## Archetypes", "");

for (const row of DATA) {
  const file = `${row.code}.md`;
  writeFileSync(join(OUT_DIR, file), buildPrompt(row), "utf8");
  indexLines.push(`- [${row.code} — ${row.name}](${file})`);
}

writeFileSync(join(OUT_DIR, "index.md"), indexLines.join("\n") + "\n", "utf8");

console.log(`Wrote ${DATA.length} prompt files to ${OUT_DIR}`);
console.log(`Index: ${join(OUT_DIR, "index.md")}`);
