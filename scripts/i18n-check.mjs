import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const APP = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const I18N = path.join(APP, 'src', 'i18n');
const LOCALES = ['ar', 'tr', 'hi', 'fr', 'ru', 'pt', 'es', 'it'];
const MODULES = ['lobby', 'account', 'rg', 'legal', 'content', 'misc', 'notifications'];
const listMissing = process.argv.includes('--list');
const findUnused = process.argv.includes('--unused');

const parse = (file) =>
  ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);

const findObject = (sourceFile, name) => {
  let found = null;
  sourceFile.forEachChild((node) => {
    if (!ts.isVariableStatement(node)) return;
    for (const decl of node.declarationList.declarations) {
      if (!ts.isIdentifier(decl.name) || decl.name.text !== name || !decl.initializer) continue;
      const init = ts.isAsExpression(decl.initializer) ? decl.initializer.expression : decl.initializer;
      if (ts.isObjectLiteralExpression(init)) found = init;
    }
  });
  if (!found) throw new Error(`${path.basename(sourceFile.fileName)}: no object literal '${name}'`);
  return found;
};

const keysOf = (objectLiteral) =>
  objectLiteral.properties.filter(ts.isPropertyAssignment).map((prop) => prop.name.text);

const english = [
  ...keysOf(findObject(parse(path.join(I18N, 'locales.ts')), 'coreEn')),
  ...MODULES.flatMap((m) => keysOf(findObject(parse(path.join(I18N, 'modules', `${m}.ts`)), 'en'))),
];
const englishKeys = new Set(english);

const sourceFiles = (dir, out = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'translations') sourceFiles(full, out);
      continue;
    }
    if (!/\.(ts|tsx)$/.test(entry.name)) continue;
    const rel = path.relative(APP, full).replace(/\\/g, '/');
    if (rel === 'src/i18n/locales.ts' || rel.startsWith('src/i18n/modules/')) continue;
    out.push(full);
  }
  return out;
};

const unused = () => {
  const blob = sourceFiles(path.join(APP, 'src'))
    .map((file) => fs.readFileSync(file, 'utf8'))
    .join('\n');
  return english.filter(
    (key) =>
      !blob.includes(`'${key}'`) && !blob.includes(`"${key}"`) && !blob.includes(`\`${key}\``)
  );
};

const rows = [];
let errors = 0;

const declaredLocales = () => {
  let found = null;
  parse(path.join(I18N, 'locales.ts')).forEachChild((node) => {
    if (!ts.isVariableStatement(node)) return;
    for (const decl of node.declarationList.declarations) {
      if (!ts.isIdentifier(decl.name) || decl.name.text !== 'LOCALES' || !decl.initializer) continue;
      const init = ts.isAsExpression(decl.initializer) ? decl.initializer.expression : decl.initializer;
      if (ts.isArrayLiteralExpression(init)) found = init.elements.map((el) => el.text);
    }
  });
  return found ?? [];
};

const { default: nextConfig } = await import(pathToFileURL(path.join(APP, 'next.config.mjs')).href);
const routed = nextConfig.i18n?.locales ?? [];
const declared = declaredLocales();
const expected = ['en', ...LOCALES];
for (const [label, list] of [
  ['next.config.mjs i18n.locales', routed],
  ['src/i18n/locales.ts LOCALES', declared],
]) {
  if (list.join() !== expected.join()) {
    console.error(`${label} is [${list.join(', ')}] — expected [${expected.join(', ')}]`);
    errors += 1;
  }
}
if (nextConfig.i18n?.defaultLocale !== 'en') {
  console.error(`next.config.mjs i18n.defaultLocale must be 'en'`);
  errors += 1;
}

for (const locale of LOCALES) {
  const file = path.join(I18N, 'translations', `${locale}.json`);
  let dict;
  try {
    dict = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    console.error(`${locale}.json: ${err.message}`);
    errors += 1;
    continue;
  }

  const stale = Object.keys(dict).filter((key) => !englishKeys.has(key));
  const missing = english.filter((key) => !(key in dict));
  const empty = Object.keys(dict).filter((key) => dict[key] === '');
  const nonString = Object.keys(dict).filter((key) => typeof dict[key] !== 'string');

  for (const key of stale) {
    console.error(`${locale}.json: '${key}' is not an English key — rename it or remove it`);
    errors += 1;
  }
  for (const key of nonString) {
    console.error(`${locale}.json: '${key}' is not a string`);
    errors += 1;
  }
  for (const key of empty) {
    console.error(`${locale}.json: '${key}' is an empty string`);
    errors += 1;
  }

  rows.push({
    locale,
    translated: `${englishKeys.size - missing.length} / ${englishKeys.size}`,
    percent: `${Math.round(((englishKeys.size - missing.length) / englishKeys.size) * 100)}%`,
    missing: missing.length,
    stale: stale.length,
  });

  if (listMissing && missing.length > 0) {
    console.log(`\n${locale} is missing ${missing.length} key(s):`);
    for (const key of missing) console.log(`   ${key}`);
  }
}

if (listMissing) console.log('');
console.table(rows);

if (findUnused) {
  const dead = unused();
  if (dead.length === 0) {
    console.log(`\nEvery one of the ${englishKeys.size} keys is referenced.`);
  } else {
    console.log(`\n${dead.length} key(s) referenced nowhere in src/:`);
    for (const key of dead) console.log(`   ${key}`);
    console.log(
      '\nA key reached only through a computed name would be listed here too — check before deleting.'
    );
  }
}

if (errors > 0) {
  console.error(`\n${errors} problem(s) found.`);
  process.exit(1);
}

const totalMissing = rows.reduce((sum, row) => sum + row.missing, 0);
console.log(
  totalMissing === 0
    ? 'Every locale is complete.'
    : `No errors. ${totalMissing} untranslated key(s) across ${LOCALES.length} locales — run with --list to see them.`
);
