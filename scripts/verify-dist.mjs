import { access, readdir, readFile, stat } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const rootDirectory = join(dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = join(rootDirectory, "dist");
const allowedTopLevelFiles = new Set([
  ".nojekyll",
  "404.html",
  "app.html",
  "auth-client.js",
  "evidence-library.js",
  "index.html",
  "main.js",
  "profile-api.js",
  "robots.txt",
  "runtime-config.js",
  "scenario-briefing-library.js",
  "scenario-library.js",
  "scoring-api.js",
  "scoring-preview.js",
  "site.webmanifest",
  "sitemap.xml",
  "styles.css",
  "welcome.css",
  "welcome.js",
]);

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolutePath = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listFiles(absolutePath));
    } else {
      files.push(absolutePath);
    }
  }
  return files;
}

if (!(await stat(outputDirectory)).isDirectory()) {
  throw new Error("dist/ がありません。先に npm run build を実行してください。");
}

const files = await listFiles(outputDirectory);
for (const absolutePath of files) {
  const outputPath = relative(outputDirectory, absolutePath);
  const [topLevel] = outputPath.split("/");
  if (topLevel !== "assets" && !allowedTopLevelFiles.has(outputPath)) {
    throw new Error(`公開対象外のファイルが dist/ に含まれています: ${outputPath}`);
  }
  if (/(^|\/)(\.env|backend|docs|scoring|node_modules)(\/|$)/.test(outputPath)) {
    throw new Error(`機密または内部ファイルが dist/ に含まれています: ${outputPath}`);
  }
}

const welcomeHtml = await readFile(join(outputDirectory, "index.html"), "utf8");
const appHtml = await readFile(join(outputDirectory, "app.html"), "utf8");
const manifest = await readFile(join(outputDirectory, "site.webmanifest"), "utf8");

async function verifyLocalReferences(html, sourceFile) {
  const references = [...html.matchAll(/\b(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
  for (const reference of references) {
    if (/^(?:https?:|mailto:|tel:|data:|#)/.test(reference)) {
      continue;
    }
    const cleanReference = reference.split(/[?#]/, 1)[0];
    const targetPath = cleanReference === "./" || cleanReference === "/"
      ? "index.html"
      : cleanReference.replace(/^\.\//, "").replace(/^\//, "");
    try {
      await access(join(outputDirectory, targetPath));
    } catch {
      throw new Error(`${sourceFile}の参照先が公開成果物にありません: ${reference}`);
    }
  }
}

await verifyLocalReferences(welcomeHtml, "index.html");
await verifyLocalReferences(appHtml, "app.html");

const requiredWelcomeFragments = [
  'href="./"',
  'href="./app.html?guest=1"',
  'href="./app.html"',
  'href="https://akamain.com/"',
  'content="https://akamain.com/assets/images/brand/akamain-main-visual.png"',
];
for (const fragment of requiredWelcomeFragments) {
  if (!welcomeHtml.includes(fragment)) {
    throw new Error(`公開トップページの必須設定がありません: ${fragment}`);
  }
}
if (welcomeHtml.includes("./welcome.html") || welcomeHtml.includes("./index.html")) {
  throw new Error("公開トップページにローカル用URLが残っています。");
}
if (!files.some((filePath) => relative(outputDirectory, filePath) === "welcome.js")) {
  throw new Error("Welcomeページの動作スクリプトが公開成果物にありません。");
}
if (!appHtml.includes('<meta name="robots" content="noindex, nofollow" />')) {
  throw new Error("アプリ画面の検索除外設定がありません。");
}
if (!manifest.includes('"start_url": "./"')) {
  throw new Error("Webアプリの開始URLが公開トップになっていません。");
}

console.log(`公開成果物を検証しました: ${files.length}ファイル`);
