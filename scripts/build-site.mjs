import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDirectory = join(dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = join(rootDirectory, "dist");

function replaceRequired(source, search, replacement, label) {
  if (!source.includes(search)) {
    throw new Error(`公開用ビルドに必要な置換対象が見つかりません: ${label}`);
  }
  return source.replaceAll(search, replacement);
}

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

let welcomeHtml = await readFile(join(rootDirectory, "welcome.html"), "utf8");
welcomeHtml = replaceRequired(welcomeHtml, 'href="./welcome.html"', 'href="./"', "Welcomeホームリンク");
welcomeHtml = replaceRequired(
  welcomeHtml,
  'href="./index.html?guest=1"',
  'href="./app.html?guest=1"',
  "ゲスト体験リンク"
);
welcomeHtml = replaceRequired(
  welcomeHtml,
  'href="./index.html"',
  'href="./app.html"',
  "ログイン後の開始リンク"
);
await writeFile(join(outputDirectory, "index.html"), welcomeHtml);

await mkdir(join(outputDirectory, "bug-report-writing"), { recursive: true });
await cp(
  join(rootDirectory, "bug-report-writing", "index.html"),
  join(outputDirectory, "bug-report-writing", "index.html")
);

let appHtml = await readFile(join(rootDirectory, "index.html"), "utf8");
appHtml = replaceRequired(
  appHtml,
  '<meta name="viewport" content="width=device-width, initial-scale=1" />',
  '<meta name="viewport" content="width=device-width, initial-scale=1" />\n    <meta name="robots" content="noindex, nofollow" />',
  "アプリ画面の検索除外設定"
);
await writeFile(join(outputDirectory, "app.html"), appHtml);

let manifest = await readFile(join(rootDirectory, "site.webmanifest"), "utf8");
manifest = replaceRequired(manifest, '"start_url": "./welcome.html"', '"start_url": "./"', "PWA開始URL");
await writeFile(join(outputDirectory, "site.webmanifest"), manifest);

const publicFiles = [
  "auth-client.js",
  "evidence-library.js",
  "guide.css",
  "main.js",
  "profile-api.js",
  "qa-scenario-authoring-library.js",
  "runtime-config.js",
  "scenario-authoring-library.js",
  "scenario-briefing-library.js",
  "scenario-library.js",
  "scoring-api.js",
  "scoring-preview.js",
  "styles.css",
  "welcome.css",
  "welcome.js",
];

for (const fileName of publicFiles) {
  await cp(join(rootDirectory, fileName), join(outputDirectory, fileName));
}

await cp(join(rootDirectory, "assets"), join(outputDirectory, "assets"), { recursive: true });
await cp(join(rootDirectory, "static", "404.html"), join(outputDirectory, "404.html"));
await cp(join(rootDirectory, "static", "robots.txt"), join(outputDirectory, "robots.txt"));
await cp(join(rootDirectory, "static", "sitemap.xml"), join(outputDirectory, "sitemap.xml"));
await writeFile(join(outputDirectory, ".nojekyll"), "");

console.log("公開用ファイルを dist/ に生成しました。");
