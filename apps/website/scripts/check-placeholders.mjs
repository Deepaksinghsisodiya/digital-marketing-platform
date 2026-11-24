#!/usr/bin/env node

/**
 * scripts/check-placeholders.mjs
 * Production Gatekeeper: Fails build if placeholder values or TODO_REAL_VALUE remain in site.config.ts or content files.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.resolve(__dirname, '../src/content');
const configPath = path.resolve(contentDir, 'site.config.ts');

const allowPlaceholders = process.env.ALLOW_PLACEHOLDERS === '1' || process.env.NODE_ENV !== 'production';

// Banned patterns for production:
const BANNED_PATTERNS = [
  { pattern: /TODO_REAL_VALUE/g, name: 'TODO_REAL_VALUE sentinel' },
  { pattern: /example\.com/gi, name: 'example.com placeholder' },
  { pattern: /lorem\s+ipsum/gi, name: 'lorem ipsum placeholder' },
  { pattern: /Ananya\s+Rao/gi, name: 'Ananya Rao fake testimonial' },
  { pattern: /Apex\s+Cloud\s+Solutions/gi, name: 'Apex Cloud fake client' },
  { pattern: /Enterprise\s+Growth\s+Squad/gi, name: 'invented team squad' },
];

function scanFile(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const fileViolations = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    // Skip comments and definition export / type checks
    if (
      trimmed.startsWith('//') ||
      trimmed.startsWith('/*') ||
      trimmed.startsWith('*') ||
      trimmed.startsWith('export const TODO_REAL_VALUE') ||
      trimmed.includes('type Todo =') ||
      trimmed.includes('=== TODO_REAL_VALUE')
    ) {
      return;
    }

    for (const { pattern, name } of BANNED_PATTERNS) {
      if (pattern.test(trimmed)) {
        fileViolations.push({
          file: path.relative(path.resolve(__dirname, '..'), filePath).replace(/\\/g, '/'),
          line: index + 1,
          rule: name,
          snippet: trimmed,
        });
      }
    }
  });

  return fileViolations;
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.json') || file.endsWith('.md')) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

const allContentFiles = getAllFiles(contentDir);
let allViolations = [];

for (const file of allContentFiles) {
  allViolations.push(...scanFile(file));
}

if (allViolations.length > 0) {
  console.log(`\n⚠️  Found ${allViolations.length} placeholder violation(s) across content files:`);
  allViolations.forEach((v) => {
    console.log(`  - ${v.file}:${v.line} [${v.rule}] -> ${v.snippet}`);
  });

  if (!allowPlaceholders) {
    console.error('\n❌ BUILD BLOCKED: Production build cannot proceed with unfilled business data.');
    console.error('👉 Fill real data in content files, or set ALLOW_PLACEHOLDERS=1 for staging/dev builds.\n');
    process.exit(1);
  } else {
    console.warn('\n⚠️  ALLOW_PLACEHOLDERS=1 or non-production environment detected. Continuing build with safe hiding fallback.\n');
    process.exit(0);
  }
} else {
  console.log('✅ PASS: Zero placeholders found! Real business data verified.');
  process.exit(0);
}
