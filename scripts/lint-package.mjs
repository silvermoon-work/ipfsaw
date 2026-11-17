import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { publint } from "publint";

const root = new URL("../", import.meta.url);
const require = createRequire(import.meta.url);
const manifest = JSON.parse(
  await readFile(new URL("package.json", root), "utf8"),
);
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

const dependency = require("@silvermoon-work/ipfsaw/package.json");
assert.equal(dependency.name, "@silvermoon-work/ipfsaw");
assert.equal(
  dependency.version,
  manifest.dependencies["@silvermoon-work/ipfsaw"],
  "Installed scoped package must match the exact runtime dependency.",
);
import.meta.resolve("@silvermoon-work/ipfsaw/cli");

assert.equal(
  await readFile(new URL("src/bin.ts", root), "utf8"),
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
    (await readFile(new URL(file, root))).length > 0,
    `Missing/empty delivery file: ${file}`,
  );
}

const { messages } = await publint({
  pkgDir: fileURLToPath(root),
  pack: false,
});
for (const message of messages) console.log(JSON.stringify(message));
assert(
  messages.every((message) => message.type === "suggestion"),
  "publint reported a warning or error.",
);
console.log("Package, exact dependency and publint validation passed.");
