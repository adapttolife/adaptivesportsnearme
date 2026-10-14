import test from 'node:test';import {execFileSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
test('grouped source query preserves results and avoids repeated scans',()=>{execFileSync('python3',[fileURLToPath(new URL('./test_query.py',import.meta.url))],{stdio:'pipe'})});
