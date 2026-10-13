import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const I18N = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'i18n');
const LOCALES = ['ar', 'tr', 'hi', 'fr', 'ru', 'pt', 'es', 'it'];
const MODULES = ['lobby', 'account', 'rg', 'legal', 'content', 'misc'];
const listMissing = process.argv.includes('--list');

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

const rows = [];
let errors = 0;

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
