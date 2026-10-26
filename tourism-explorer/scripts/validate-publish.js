/**
 * hyperDart Prepublish Validation Script
 * Verifies keywords, regex, links (github & demovideo), and build output.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const REQUIRED_KEYWORDS = [
  'tourist attractions',
  'things to do',
  'places to visit',
  'landmarks',
  'sights',
  'points of interest',
  'museums'
];

const REQUIRED_REGEX_FRAGMENTS = [
  'tourist\\s+attractions?',
  'HD_LOCATION'
];

let hasErrors = false;

function logPass(msg) {
  console.log(`\x1b[32m✔ PASS:\x1b[0m ${msg}`);
}

function logFail(msg) {
  console.error(`\x1b[31m✖ FAIL:\x1b[0m ${msg}`);
  hasErrors = true;
}

function logWarn(msg) {
  console.warn(`\x1b[33m▲ WARN:\x1b[0m ${msg}`);
}

console.log('\n=============================================');
console.log('🔍 hyperDart Pre-publish Validation');
console.log('=============================================\n');

// 1. Verify hyperdart.config.js exists
const configPath = path.join(rootDir, 'hyperdart.config.js');
if (!fs.existsSync(configPath)) {
  logFail('hyperdart.config.js not found in project root.');
  process.exit(1);
}
logPass('hyperdart.config.js exists.');

// 2. Load and validate configuration
let config;
try {
  const imported = await import(`file://${configPath}`);
  config = imported.default || imported;
} catch (err) {
  logFail(`Could not load hyperdart.config.js: ${err.message}`);
  process.exit(1);
}

// Check keywords
const keywords = config.keywords || config.triggers?.keywords || [];
const missingKeywords = REQUIRED_KEYWORDS.filter(kw => !keywords.includes(kw));
if (missingKeywords.length === 0) {
  logPass(`All ${REQUIRED_KEYWORDS.length} required keywords present.`);
} else {
  logFail(`Missing required keywords: ${missingKeywords.join(', ')}`);
}

// Check regexes
const regexes = config.regex || config.query_format?.regex || [];
if (regexes.length >= 2) {
  const regexStr = regexes.join(' ');
  const hasAllFrags = REQUIRED_REGEX_FRAGMENTS.every(f => regexStr.includes(f));
  if (hasAllFrags) {
    logPass(`Required trigger regex patterns verified (${regexes.length} patterns configured).`);
  } else {
    logFail('Trigger regex missing required HD_LOCATION matching patterns.');
  }
} else {
  logFail('hyperdart.config.js must define at least 2 trigger regex patterns.');
}

// Check GitHub link
const githubUrl = config.github;
if (!githubUrl || typeof githubUrl !== 'string' || githubUrl.trim() === '') {
  logFail('Missing "github" URL in hyperdart.config.js.');
} else if (!githubUrl.startsWith('https://github.com/')) {
  logFail(`"github" must be a valid https://github.com/<user>/<repo> link (got "${githubUrl}").`);
} else if (githubUrl.includes('/tree/')) {
  logFail(`"github" must point to repo root, not a /tree/main link (got "${githubUrl}").`);
} else {
  logPass(`GitHub repository link verified: ${githubUrl}`);
}

// Check Demo video link
const demovideo = config.demovideo;
if (!demovideo || typeof demovideo !== 'string' || demovideo.trim() === '') {
  logFail('Missing "demovideo" URL in hyperdart.config.js.');
} else if (!demovideo.startsWith('https://www.youtube.com/') && !demovideo.startsWith('https://youtu.be/')) {
  logFail(`"demovideo" must be a valid YouTube URL (got "${demovideo}").`);
} else {
  logPass(`Demo video link verified: ${demovideo}`);
}

// 3. Verify Build Output
const distDir = path.join(rootDir, 'dist');
if (!fs.existsSync(distDir)) {
  logWarn('dist/ directory does not exist yet. Please run `npm run build` before publishing.');
} else {
  const files = fs.readdirSync(distDir);
  if (files.length === 0) {
    logFail('dist/ directory is empty. Run `npm run build` first.');
  } else {
    logPass(`Build artifacts present in dist/ (${files.length} files: ${files.join(', ')}).`);
  }
}

// 4. Verify package.json
const pkgPath = path.join(rootDir, 'package.json');
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  if (pkg.private === true) {
    logFail('package.json has "private: true". Must be "private: false" for hyperDart publishing.');
  } else {
    logPass('package.json "private: false" confirmed.');
  }

  if (pkg.publishConfig?.registry?.includes('dev-registry.hyperdart.com')) {
    logPass(`Publish registry verified: ${pkg.publishConfig.registry}`);
  } else {
    logWarn('publishConfig.registry is recommended to point to "https://dev-registry.hyperdart.com".');
  }
}

console.log('\n---------------------------------------------');
if (hasErrors) {
  console.error('\x1b[31mValidation FAILED. Please resolve errors above before publishing.\x1b[0m\n');
  process.exit(1);
} else {
  console.log('\x1b[32mValidation SUCCESS! Ready for hyperDart packaging & publishing.\x1b[0m\n');
  process.exit(0);
}
