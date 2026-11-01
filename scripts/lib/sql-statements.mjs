// Split SQL into statements on ";" outside of 'strings', "identifiers", -- line comments and
// /* block comments */. Shared by the staging rebuild (d1-replace-file.mjs) and its tests.
export function statements(sql) {
  // Split on ";" outside of 'strings', "identifiers", -- line comments and /* block comments */.
  const out = [];
  let cur = "",
    mode = "";
  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i],
      next = sql[i + 1];
    if (mode === "line") {
      if (ch === "\n") mode = "";
      cur += ch;
      continue;
    }
    if (mode === "block") {
      cur += ch;
      if (ch === "*" && next === "/") {
        cur += next;
        i++;
        mode = "";
      }
      continue;
    }
    if (mode === "'" || mode === '"') {
      cur += ch;
      if (ch === mode) {
        if (next === mode) {
          cur += next;
          i++;
        } else mode = "";
      }
      continue;
    }
    if (ch === "-" && next === "-") {
      mode = "line";
      cur += ch;
      continue;
    }
    if (ch === "/" && next === "*") {
      mode = "block";
      cur += ch;
      continue;
    }
    if (ch === "'" || ch === '"') {
      mode = ch;
      cur += ch;
      continue;
    }
    cur += ch;
    if (ch === ";") {
      const st = cur.trim();
      if (st && st !== ";") out.push(st);
      cur = "";
    }
  }
  const rest = cur.trim();
  if (rest && !/^(--[^\n]*\n?\s*)*$/.test(rest))
    out.push(rest.endsWith(";") ? rest : rest + ";");
  return out;
}
