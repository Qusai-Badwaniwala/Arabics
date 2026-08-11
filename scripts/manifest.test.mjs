// node scripts/manifest.test.mjs
//
// Guards the one invariant everything downstream trusts: re-running the manifest
// must never lose extraction state. It was lost once already — PowerShell writes
// UTF-8 with a BOM, JSON.parse rejected it, and a bare .catch() silently replaced
// the whole manifest with an empty one.

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(new URL('./manifest.mjs', import.meta.url));
const run = (inbox) =>
  execFileSync(process.execPath, [SCRIPT, inbox], { encoding: 'utf8' });
const read = async (inbox) =>
  JSON.parse(
    (await readFile(join(inbox, 'manifest.json'), 'utf8')).replace(/^﻿/, ''),
  );

const inbox = await mkdtemp(join(tmpdir(), 'inbox-'));
try {
  await mkdir(join(inbox, 'quran'), { recursive: true });
  await writeFile(join(inbox, 'quran', 'sample.txt'), 'بِسْمِ ٱللَّهِ');

  run(inbox);
  const first = await read(inbox);
  assert.equal(first.sources.length, 1, 'one source expected');

  // Pretend the pipeline extracted it, and write the manifest back WITH a BOM,
  // exactly as PowerShell would.
  first.sources[0].extracted = { lexemes: 42 };
  await writeFile(
    join(inbox, 'manifest.json'),
    '﻿' + JSON.stringify(first, null, 2),
  );

  run(inbox);
  const second = await read(inbox);
  assert.equal(
    second.sources.length,
    1,
    're-run must not duplicate the source',
  );
  assert.deepEqual(
    second.sources[0].extracted,
    { lexemes: 42 },
    'extraction state must survive a BOM-prefixed re-run',
  );

  // A genuinely corrupt manifest must abort, not silently wipe state.
  await writeFile(join(inbox, 'manifest.json'), '{ not json');
  assert.throws(
    () => run(inbox),
    /refusing to overwrite/,
    'corrupt manifest must abort loudly',
  );
  assert.equal(
    await readFile(join(inbox, 'manifest.json'), 'utf8'),
    '{ not json',
    'corrupt manifest must be left untouched',
  );

  console.log('manifest.test.mjs: all assertions passed');
} finally {
  await rm(inbox, { recursive: true, force: true });
}
