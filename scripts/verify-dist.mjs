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
  "legal.css",
  "main.js",
  "privacy.html",
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
  "terms.html",
  "welcome.css",
  "welcome.js",
]);
const allowedTopLevelDirectories = new Set(["assets", "bug-report-writing", "qa-question-writing"]);

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
const qaQuestionGuideHtml = await readFile(join(outputDirectory, "qa-question-writing", "index.html"), "utf8");
const privacyHtml = await readFile(join(outputDirectory, "privacy.html"), "utf8");
const termsHtml = await readFile(join(outputDirectory, "terms.html"), "utf8");
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
await verifyLocalReferences(qaQuestionGuideHtml, "qa-question-writing/index.html");
await verifyLocalReferences(privacyHtml, "privacy.html");
await verifyLocalReferences(termsHtml, "terms.html");

const requiredWelcomeFragments = [
  '<title>あかマイン｜QA確認・不具合報告の起票トレーニング</title>',
  'href="./welcome.css?v=20260828b"',
  'href="./"',
  'href="./app.html"',
  'href="https://akamain.com/"',
  'content="https://akamain.com/assets/images/brand/akamain-main-visual.png"',
  'テストエンジニアのための起票トレーニング',
  '<h1 id="welcomeTitle" class="hero-brand-name"><span>あか</span>マイン</h1>',
  '問いと気づきに、<strong>伝わる技術</strong>を。',
  '現場でそのまま使えるQA確認と不具合報告の力',
  '"@type": "WebSite"',
  '"alternateName": ["akamain", "アカマイン", "akamain.com"]',
  'href="./qa-question-writing">QA確認</a>',
  'href="./bug-report-writing">不具合報告</a>',
  'QA確認の書き方を読む',
  '不具合報告の書き方を読む',
  'href="./terms.html"',
  'href="./privacy.html"',
];
for (const fragment of requiredWelcomeFragments) {
  if (!welcomeHtml.includes(fragment)) {
    throw new Error(`公開トップページの必須設定がありません: ${fragment}`);
  }
}
if (welcomeHtml.includes("./welcome.html") || welcomeHtml.includes("./index.html")) {
  throw new Error("公開トップページにローカル用URLが残っています。");
}
if (welcomeHtml.includes("guest=1") || appHtml.includes("guest=1")) {
  throw new Error("廃止したゲスト自動開始パラメータが公開成果物に残っています。");
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
if (!bugReportGuideHtml.includes('href="/app.html"')) {
  throw new Error("バグ報告ガイドからゲスト体験への導線がありません。");
}
if (!qaQuestionGuideHtml.includes('<link rel="canonical" href="https://akamain.com/qa-question-writing" />')) {
  throw new Error("QA確認ガイドのcanonical設定がありません。");
}
if (!qaQuestionGuideHtml.includes('href="/app.html"')) {
  throw new Error("QA確認ガイドからゲスト体験への導線がありません。");
}
if (!bugReportGuideHtml.includes('href="/terms.html"') || !bugReportGuideHtml.includes('href="/privacy.html"')) {
  throw new Error("バグ報告ガイドに法務ページへの導線がありません。");
}
if (!qaQuestionGuideHtml.includes('href="/terms.html"') || !qaQuestionGuideHtml.includes('href="/privacy.html"')) {
  throw new Error("QA確認ガイドに法務ページへの導線がありません。");
}
if (!privacyHtml.includes("AIレビューへの情報送信") || !privacyHtml.includes("個人情報・機密情報を入力しないでください")) {
  throw new Error("プライバシーポリシーにAIレビューのデータ取扱いがありません。");
}
if (!termsHtml.includes("入力してはいけない情報") || !termsHtml.includes("プライバシーポリシー")) {
  throw new Error("利用規約にトレーニングデータの利用条件がありません。");
}
const sitemap = await readFile(join(outputDirectory, "sitemap.xml"), "utf8");
if (!sitemap.includes("https://akamain.com/bug-report-writing")) {
  throw new Error("sitemapにバグ報告ガイドが登録されていません。");
}
if (!sitemap.includes("https://akamain.com/qa-question-writing")) {
  throw new Error("sitemapにQA確認ガイドが登録されていません。");
}
if (!sitemap.includes("https://akamain.com/privacy.html")) {
  throw new Error("sitemapにプライバシーポリシーが登録されていません。");
}
if (!sitemap.includes("https://akamain.com/terms.html")) {
  throw new Error("sitemapに利用規約が登録されていません。");
}
if (!manifest.includes('"start_url": "./"')) {
  throw new Error("Webアプリの開始URLが公開トップになっていません。");
}

console.log(`公開成果物を検証しました: ${files.length}ファイル`);
