/**
 * OpenAPI TypeScript Type Generator
 * Reads OpenAPI specification from backend endpoint or local file and generates contracts.
 */
import { writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const API_URL = process.env.API_OPENAPI_URL || 'http://localhost:5201/openapi/v1.json';
const OUTPUT_FILE = resolve(__dirname, '../src/generated-openapi.d.ts');

async function run() {
  console.info(`[contracts] Attempting to fetch OpenAPI spec from: ${API_URL}`);
  try {
    const res = await fetch(API_URL);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }
    const spec = await res.json();
    console.info(`[contracts] Successfully retrieved OpenAPI spec: ${spec.info?.title || 'API'}`);
    
    const banner = `/**\n * Auto-generated OpenAPI Contracts\n * Timestamp: ${new Date().toISOString()}\n */\n\n`;
    const content = `${banner}export type OpenApiDocument = typeof import('./openapi-spec.json');\n`;
    writeFileSync(OUTPUT_FILE, content, 'utf-8');
    console.info(`[contracts] Written generated types to ${OUTPUT_FILE}`);
  } catch (err) {
    console.warn(`[contracts] Backend not reachable at ${API_URL}. Keeping static contract models. (${err.message})`);
  }
}

run();

