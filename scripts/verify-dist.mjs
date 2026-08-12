import { access, readdir, readFile, stat } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDirectory = join(dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = join(rootDirectory, "dist");
const allowedTopLevelFiles = new Set([
  ".nojekyll",
  "404.html",
  "app.html",
  "auth-client.js",
  "evidence-library.js",
  "guide.css",
  "index.html",
  "main.js",
  "profile-api.js",
  "qa-scenario-authoring-library.js",
  "robots.txt",
  "runtime-config.js",
  "scenario-authoring-library.js",
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
const allowedTopLevelDirectories = new Set(["assets", "bug-report-writing"]);

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
  if (!allowedTopLevelDirectories.has(topLevel) && !allowedTopLevelFiles.has(outputPath)) {
    throw new Error(`公開対象外のファイルが dist/ に含まれています: ${outputPath}`);
  }
  if (/(^|\/)(\.env|backend|docs|scoring|node_modules)(\/|$)/.test(outputPath)) {
    throw new Error(`機密または内部ファイルが dist/ に含まれています: ${outputPath}`);
  }
}

const welcomeHtml = await readFile(join(outputDirectory, "index.html"), "utf8");
const appHtml = await readFile(join(outputDirectory, "app.html"), "utf8");
const bugReportGuideHtml = await readFile(join(outputDirectory, "bug-report-writing", "index.html"), "utf8");
const manifest = await readFile(join(outputDirectory, "site.webmanifest"), "utf8");

async function verifyLocalReferences(html, sourceFile) {
  const references = [...html.matchAll(/\b(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
  for (const reference of references) {
    if (/^(?:https?:|mailto:|tel:|data:|#)/.test(reference)) {
      continue;
    }
    const cleanReference = reference.split(/[?#]/, 1)[0];
    const sourceDirectory = dirname(join(outputDirectory, sourceFile));
    let targetPath = cleanReference.startsWith("/")
      ? resolve(outputDirectory, `.${cleanReference}`)
      : resolve(sourceDirectory, cleanReference);
    if (cleanReference === "./" || cleanReference === "/" || cleanReference.endsWith("/")) {
      targetPath = join(targetPath, "index.html");
    }
    if (!targetPath.startsWith(`${outputDirectory}/`) && targetPath !== outputDirectory) {
      throw new Error(`${sourceFile}の参照先が公開ディレクトリ外です: ${reference}`);
    }
    try {
      const targetStat = await stat(targetPath);
      if (targetStat.isDirectory()) {
        await access(join(targetPath, "index.html"));
      }
    } catch {
      throw new Error(`${sourceFile}の参照先が公開成果物にありません: ${reference}`);
    }
  }
}

await verifyLocalReferences(welcomeHtml, "index.html");
await verifyLocalReferences(appHtml, "app.html");
await verifyLocalReferences(bugReportGuideHtml, "bug-report-writing/index.html");

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
if (!bugReportGuideHtml.includes('<link rel="canonical" href="https://akamain.com/bug-report-writing" />')) {
  throw new Error("バグ報告ガイドのcanonical設定がありません。");
}
if (!bugReportGuideHtml.includes('href="/app.html?guest=1"')) {
  throw new Error("バグ報告ガイドからゲスト体験への導線がありません。");
}
const sitemap = await readFile(join(outputDirectory, "sitemap.xml"), "utf8");
if (!sitemap.includes("https://akamain.com/bug-report-writing")) {
  throw new Error("sitemapにバグ報告ガイドが登録されていません。");
}
if (!manifest.includes('"start_url": "./"')) {
  throw new Error("Webアプリの開始URLが公開トップになっていません。");
}

console.log(`公開成果物を検証しました: ${files.length}ファイル`);
