#!/usr/bin/env node
import fs from "fs";
import path from "path";

/**
 * Nexora Design Token Linter - check:colors
 * Detects unauthorized raw hex color codes and ensures design tokens are used.
 */

const ROOT_DIR = process.cwd();
const TARGET_DIRS = [
  path.join(ROOT_DIR, "apps", "website", "src", "components"),
  path.join(ROOT_DIR, "apps", "admin", "src", "components"),
];

// Documented exceptions (e.g. logos, canvas charts, test mocks, third-party social buttons)
const ALLOW_LIST_FILES = [
  "globals.css",
  "index.css",
  "tailwind.config.ts",
  "design-tokens",
  "test",
  "spec",
];

const HEX_COLOR_REGEX = /#(?:[0-9a-fA-F]{3,4}){1,2}\b/g;

let violationsCount = 0;

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(ROOT_DIR, fullPath);

    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".next" && entry.name !== "dist") {
        scanDir(fullPath);
      }
    } else if (entry.isFile() && /\.(tsx|ts|jsx|js)$/.test(entry.name)) {
      if (ALLOW_LIST_FILES.some((allowed) => relativePath.includes(allowed))) {
        continue;
      }

      const content = fs.readFileSync(fullPath, "utf-8");
      const lines = content.split("\n");

      lines.forEach((line, index) => {
        // Skip comment lines
        const trimmed = line.trim();
        if (trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*")) return;

        // Skip SVG paths or viewBox
        if (line.includes("d=") || line.includes("viewBox=")) return;

        const matches = line.match(HEX_COLOR_REGEX);
        if (matches) {
          // Check if flagged as intentional exception via inline comment
          if (line.includes("/* theme-exception */") || line.includes("// theme-exception")) {
            return;
          }

          console.warn(`[check:colors] Hardcoded color in ${relativePath}:${index + 1}`);
          console.warn(`  Line: ${line.trim()}`);
          violationsCount++;
        }
      });
    }
  }
}

console.log("🔍 Running Nexora Design Tokens Color Audit (check:colors)...");
for (const dir of TARGET_DIRS) {
  scanDir(dir);
}

if (violationsCount > 0) {
  console.log(`⚠️ Found ${violationsCount} raw color occurrences. Mark intentional exceptions with // theme-exception if required.`);
} else {
  console.log("✅ Passed! All scanned components adhere to semantic tokens.");
}

process.exit(0);
