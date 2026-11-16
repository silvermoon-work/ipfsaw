import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { readFile, readdir, rm } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../../", import.meta.url)));
const require = createRequire(import.meta.url);
const actions = [
  "build",
  "check",
  "check-scripts",
  "format",
  "format-check",
  "lint",
  "lint-package",
  "test",
  "test-coverage",
  "typecheck",
  "verify-candidate",
];
const candidateSha256 =
  "766a1fe8db0af60ff00bca5e67a87617551c0d17f55de02232336b45a6994db8";
const json = async (path) =>
  JSON.parse(await readFile(join(root, path), "utf8"));
function tool(packageName, binary, args) {
  const manifestPath = require.resolve(`${packageName}/package.json`);
  const manifest = require(manifestPath);
  const entry =
    typeof manifest.bin === "string" ? manifest.bin : manifest.bin[binary];
  assert.equal(typeof entry, "string", `Missing tool binary: ${binary}`);
  const result = spawnSync(
    process.execPath,
    [join(dirname(manifestPath), entry), ...args],
    { cwd: root, stdio: "inherit" },
  );
  if (result.error) throw result.error;
  assert.equal(
    result.status,
    0,
    `${binary} failed (${result.status ?? result.signal})`,
  );
}
async function verifyCandidate() {
  const candidate = await readFile(join(root, ".artifacts", "scoped-main.tgz"));
  assert.equal(
    createHash("sha256").update(candidate).digest("hex"),
    candidateSha256,
    "Wrong scoped candidate. See README; never substitute a stub or unknown tarball.",
  );
  console.log(`Scoped candidate SHA-256 verified: ${candidateSha256}`);
}
async function checkScripts() {
  const manifest = await json("package.json");
  const entries = (await readdir(join(root, "scripts")))
    .filter((name) => name.endsWith(".mjs"))
    .sort();
  assert.deepEqual(Object.keys(manifest.scripts).sort(), [...actions].sort());
  assert.deepEqual(entries, actions.map((name) => `${name}.mjs`).sort());
  for (const name of actions) {
    assert(!name.includes(":"));
    assert.equal(manifest.scripts[name], `node scripts/${name}.mjs`);
    assert.equal(
      await readFile(join(root, "scripts", `${name}.mjs`), "utf8"),
      `import { run } from "./lib/commands.mjs";\nawait run("${name}");\n`,
    );
  }
  console.log("Script names, entries and one-to-one mapping verified.");
}
async function checkPackage() {
  const manifest = await json("package.json");
  assert.equal(manifest.name, "ipfsaw");
  assert.equal(manifest.version, "0.1.0-rc.0");
  assert.equal(manifest.private, true);
  assert.equal(manifest.type, "module");
  assert.equal(manifest.license, "MIT");
  assert.equal(manifest.packageManager, "pnpm@11.28.12");
  assert.deepEqual(manifest.dependencies, {
    "@silvermoon-work/ipfsaw": "0.1.0-rc.0",
  });
  assert.deepEqual(manifest.bin, { ipfsaw: "./dist/bin.js" });
  assert.deepEqual(manifest.exports, { "./package.json": "./package.json" });
  assert.deepEqual(manifest.files, ["dist", "src", "README.md", "LICENSE"]);
  const source = await readFile(join(root, "src/bin.ts"), "utf8");
  assert.equal(
    source,
    '#!/usr/bin/env node\nimport { main } from "@silvermoon-work/ipfsaw/cli";\nprocess.exitCode = await main(process.argv.slice(2));\n',
  );
  for (const file of [
    "dist/bin.js",
    "dist/bin.js.map",
    "dist/bin.d.ts",
    "dist/bin.d.ts.map",
    "README.md",
    "LICENSE",
  ]) {
    assert(
      (await readFile(join(root, file))).length > 0,
      `Missing/empty delivery file: ${file}`,
    );
  }
  const { publint } = await import("publint");
  const { messages } = await publint({ pkgDir: root, pack: false });
  for (const message of messages) console.log(JSON.stringify(message));
  assert(
    messages.every((message) => message.type === "suggestion"),
    "publint reported a warning or error.",
  );
  console.log(
    "publint filesystem validation passed (pack:false, warnings fail).",
  );
}
async function execute(action) {
  switch (action) {
    case "verify-candidate":
      await verifyCandidate();
      return;
    case "check-scripts":
      await checkScripts();
      return;
    case "build": {
      const output = resolve(root, "dist");
      assert.equal(dirname(output), root);
      assert.equal(basename(output), "dist");
      console.log(`Replacing owned build output: ${output}`);
      await rm(output, { recursive: true, force: true });
      tool("typescript", "tsc", ["--project", "tsconfig.build.json"]);
      return;
    }
    case "format":
      tool("prettier", "prettier", ["--write", "."]);
      return;
    case "format-check":
      tool("prettier", "prettier", ["--check", "."]);
      return;
    case "typecheck":
      tool("typescript", "tsc", ["--noEmit", "--project", "tsconfig.json"]);
      return;
    case "lint":
      tool("eslint", "eslint", [".", "--max-warnings=0"]);
      return;
    case "test":
    case "test-coverage":
      tool("vitest", "vitest", [
        "run",
        "--root",
        ".",
        "--config",
        "vitest.config.ts",
        "--watch=false",
        "--passWithNoTests=false",
        ...(action === "test-coverage" ? ["--coverage.enabled=true"] : []),
      ]);
      return;
    case "lint-package":
      await checkPackage();
      return;
    case "check":
      for (const step of [
        "verify-candidate",
        "format-check",
        "build",
        "typecheck",
        "lint",
        "test-coverage",
        "check-scripts",
        "lint-package",
      ])
        await execute(step);
      return;
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}
export async function run(action) {
  assert.equal(
    process.argv.length,
    2,
    "Fixed script entries do not accept arguments.",
  );
  assert(actions.includes(action), "Unknown fixed entry.");
  await execute(action);
}
