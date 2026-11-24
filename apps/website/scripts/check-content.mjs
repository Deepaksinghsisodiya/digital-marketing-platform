import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.resolve(__dirname, '../src/content/site.config.ts');

if (!fs.existsSync(configPath)) {
  console.error(`❌ Config file not found at: ${configPath}`);
  process.exit(1);
}

const content = fs.readFileSync(configPath, 'utf8');

console.log('\n🔍 Checking site.config.ts for unfilled real business data...\n');

const lines = content.split('\n');
const missingFields = [];

lines.forEach((line, index) => {
  const trimmed = line.trim();
  if (
    trimmed.includes('TODO_REAL_VALUE') &&
    !trimmed.startsWith('//') &&
    !trimmed.startsWith('*') &&
    !trimmed.startsWith('export const TODO_REAL_VALUE') &&
    !trimmed.startsWith('type Todo =') &&
    !trimmed.startsWith('if ((value')
  ) {
    const match = trimmed.match(/([a-zA-Z0-9_]+)\s*[:=]\s*TODO_REAL_VALUE/);
    const fieldName = match ? match[1] : trimmed;
    missingFields.push({
      line: index + 1,
      field: fieldName,
      raw: trimmed
    });
  }
});

const emptyArrayChecks = [
  { name: 'team (Team Members)', pattern: /team:\s*\[\]\s*as\s*TeamMember\[\]/ },
  { name: 'clients (Client Logos)', pattern: /clients:\s*\[\]\s*as\s*ClientLogo\[\]/ },
  { name: 'testimonials', pattern: /testimonials:\s*\[\]\s*as\s*Testimonial\[\]/ },
  { name: 'caseStudies', pattern: /caseStudies:\s*\[\]\s*as\s*CaseStudyCard\[\]/ },
  { name: 'certifications', pattern: /certifications:\s*\[\]\s*as\s*Certification\[\]/ },
  { name: 'stats', pattern: /stats:\s*\[\]\s*as\s*StatCounter\[\]/ },
  { name: 'officePhotos', pattern: /officePhotos:\s*\[\]\s*as\s*string\[\]/ }
];

const emptySections = [];
emptyArrayChecks.forEach(check => {
  if (check.pattern.test(content)) {
    emptySections.push(check.name);
  }
});

console.log('─────────────────────────────────────────────────────────────');
console.log(`📋 Unfilled TODO_REAL_VALUE fields: ${missingFields.length}`);
missingFields.forEach(item => {
  console.log(`   • Line ${item.line}: ${item.field}`);
});

console.log('\n📁 Empty Sections (Will auto-hide safely on site):');
emptySections.forEach(sec => {
  console.log(`   • ${sec}`);
});
console.log('─────────────────────────────────────────────────────────────');

if (missingFields.length > 0) {
  console.log(`\n⚠️  Found ${missingFields.length} unfilled fields in site.config.ts.`);
  console.log(`ℹ️  Note: Empty sections gracefully hide from visitors.`);
  console.log(`📖 See MISSING_CONTENT.md for instructions on filling each field.\n`);
  
  if (process.env.STRICT_CHECK === 'true') {
    process.exit(1);
  }
} else {
  console.log('\n✅ All business data fields are filled! Zero placeholders.\n');
}
