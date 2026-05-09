import { useState, useEffect, useRef, useCallback } from "react";

// ─── Color palette ────────────────────────────────────────────────────────────
const C = {
  bg:          "#111318",
  panel:       "#181b22",
  panelAlt:    "#1c1f27",
  border:      "#252830",
  borderLight: "#2e3240",
  text:        "#d0d4de",
  muted:       "#5c6070",
  dimmed:      "#3a3e4a",
  lineNum:     "#3f4352",
  accent:      "#e8a623",
  accentSub:   "rgba(232,166,35,0.09)",
  assign:      "#7ea8f8",
  assignBg:    "rgba(126,168,248,0.08)",
  condTrue:    "#52c17a",
  condTrueBg:  "rgba(82,193,122,0.08)",
  condFalse:   "#e87070",
  condFalseBg: "rgba(232,112,112,0.08)",
  done:        "#5bc9a8",
  doneBg:      "rgba(91,201,168,0.08)",
  kwColor:     "#c78cf5",
  strColor:    "#a8cc7a",
  numColor:    "#f0956c",
  commentColor:"#4a5568",
  opColor:     "#7ecfe0",
  fnColor:     "#80b0ff",
};

// ─── Execution programs ───────────────────────────────────────────────────────
const PROGRAMS = {
  ifelse: {
    label: "if / else",
    desc: "Branching on conditions",
    code: [
      "let score = 75;",
      "let grade;",
      "",
      "if (score >= 90) {",
      '  grade = "A";',
      "} else if (score >= 70) {",
      '  grade = "B";',
      "} else {",
      '  grade = "C";',
      "}",
    ],
    steps: [
      { line: 1, vars: { score: 75 },                    msg: "Declare score and assign 75",                       type: "assign",    changed: ["score"] },
      { line: 2, vars: { score: 75, grade: "undefined" }, msg: "Declare grade — no value assigned yet",            type: "assign",    changed: ["grade"] },
      { line: 4, vars: { score: 75, grade: "undefined" }, msg: "Evaluate: score >= 90  →  75 ≥ 90  →  false",     type: "condFalse"  },
      { line: 6, vars: { score: 75, grade: "undefined" }, msg: "Evaluate: score >= 70  →  75 ≥ 70  →  true",      type: "condTrue"   },
      { line: 7, vars: { score: 75, grade: '"B"' },       msg: 'Condition true → assign grade = "B"',             type: "assign",    changed: ["grade"] },
      { line: 10, vars: { score: 75, grade: '"B"' },      msg: "End of if/else block — execution continues",       type: "done"       },
    ],
  },

  forloop: {
    label: "for loop",
    desc: "Sum numbers 1 through 5",
    code: [
      "let sum = 0;",
      "",
      "for (let i = 1; i <= 5; i++) {",
      "  sum = sum + i;",
      "}",
      "",
      "// sum is now 15",
    ],
    steps: [
      { line: 1, vars: { sum: 0 },           msg: "Initialize sum = 0",                               type: "assign",    changed: ["sum"] },
      { line: 3, vars: { sum: 0, i: 1 },     msg: "Loop starts: i = 1. Check i <= 5 → true",          type: "condTrue",  changed: ["i"] },
      { line: 4, vars: { sum: 1, i: 1 },     msg: "sum = 0 + 1 = 1",                                  type: "assign",    changed: ["sum"] },
      { line: 3, vars: { sum: 1, i: 2 },     msg: "i++ → i = 2. Check i <= 5 → 2 ≤ 5 → true",        type: "condTrue",  changed: ["i"] },
      { line: 4, vars: { sum: 3, i: 2 },     msg: "sum = 1 + 2 = 3",                                  type: "assign",    changed: ["sum"] },
      { line: 3, vars: { sum: 3, i: 3 },     msg: "i++ → i = 3. Check i <= 5 → 3 ≤ 5 → true",        type: "condTrue",  changed: ["i"] },
      { line: 4, vars: { sum: 6, i: 3 },     msg: "sum = 3 + 3 = 6",                                  type: "assign",    changed: ["sum"] },
      { line: 3, vars: { sum: 6, i: 4 },     msg: "i++ → i = 4. Check i <= 5 → 4 ≤ 5 → true",        type: "condTrue",  changed: ["i"] },
      { line: 4, vars: { sum: 10, i: 4 },    msg: "sum = 6 + 4 = 10",                                 type: "assign",    changed: ["sum"] },
      { line: 3, vars: { sum: 10, i: 5 },    msg: "i++ → i = 5. Check i <= 5 → 5 ≤ 5 → true",        type: "condTrue",  changed: ["i"] },
      { line: 4, vars: { sum: 15, i: 5 },    msg: "sum = 10 + 5 = 15",                                type: "assign",    changed: ["sum"] },
      { line: 3, vars: { sum: 15, i: 6 },    msg: "i++ → i = 6. Check i <= 5 → 6 ≤ 5 → false. Exit", type: "condFalse", changed: ["i"] },
      { line: 7, vars: { sum: 15, i: 6 },    msg: "Loop complete. Final sum = 15",                    type: "done"       },
    ],
  },

  whileloop: {
    label: "while loop",
    desc: "Collatz sequence: n = 16 → 1",
    code: [
      "let n = 16;",
      "let steps = 0;",
      "",
      "while (n !== 1) {",
      "  if (n % 2 === 0) {",
      "    n = n / 2;",
      "  } else {",
      "    n = n * 3 + 1;",
      "  }",
      "  steps++;",
      "}",
    ],
    steps: [
      { line: 1,  vars: { n: 16, steps: 0 }, msg: "n = 16",                                             type: "assign",    changed: ["n"] },
      { line: 2,  vars: { n: 16, steps: 0 }, msg: "steps = 0",                                          type: "assign",    changed: ["steps"] },
      { line: 4,  vars: { n: 16, steps: 0 }, msg: "Check: n !== 1 → 16 ≠ 1 → true. Enter loop.",        type: "condTrue"  },
      { line: 5,  vars: { n: 16, steps: 0 }, msg: "Check: n % 2 === 0 → 16 % 2 = 0 → true",            type: "condTrue"  },
      { line: 6,  vars: { n: 8,  steps: 0 }, msg: "n = 16 / 2 = 8  (even branch)",                     type: "assign",    changed: ["n"] },
      { line: 10, vars: { n: 8,  steps: 1 }, msg: "steps++ → steps = 1",                                type: "assign",    changed: ["steps"] },
      { line: 4,  vars: { n: 8,  steps: 1 }, msg: "Check: n !== 1 → 8 ≠ 1 → true. Continue.",          type: "condTrue"  },
      { line: 5,  vars: { n: 8,  steps: 1 }, msg: "Check: 8 % 2 === 0 → true",                         type: "condTrue"  },
      { line: 6,  vars: { n: 4,  steps: 1 }, msg: "n = 8 / 2 = 4",                                     type: "assign",    changed: ["n"] },
      { line: 10, vars: { n: 4,  steps: 2 }, msg: "steps++ → steps = 2",                                type: "assign",    changed: ["steps"] },
      { line: 4,  vars: { n: 4,  steps: 2 }, msg: "Check: n !== 1 → 4 ≠ 1 → true. Continue.",          type: "condTrue"  },
      { line: 5,  vars: { n: 4,  steps: 2 }, msg: "Check: 4 % 2 === 0 → true",                         type: "condTrue"  },
      { line: 6,  vars: { n: 2,  steps: 2 }, msg: "n = 4 / 2 = 2",                                     type: "assign",    changed: ["n"] },
      { line: 10, vars: { n: 2,  steps: 3 }, msg: "steps++ → steps = 3",                                type: "assign",    changed: ["steps"] },
      { line: 4,  vars: { n: 2,  steps: 3 }, msg: "Check: n !== 1 → 2 ≠ 1 → true. Continue.",          type: "condTrue"  },
      { line: 5,  vars: { n: 2,  steps: 3 }, msg: "Check: 2 % 2 === 0 → true",                         type: "condTrue"  },
      { line: 6,  vars: { n: 1,  steps: 3 }, msg: "n = 2 / 2 = 1",                                     type: "assign",    changed: ["n"] },
      { line: 10, vars: { n: 1,  steps: 4 }, msg: "steps++ → steps = 4",                                type: "assign",    changed: ["steps"] },
      { line: 4,  vars: { n: 1,  steps: 4 }, msg: "Check: n !== 1 → 1 = 1 → false. Exit loop.",         type: "condFalse" },
      { line: 11, vars: { n: 1,  steps: 4 }, msg: "Done! Reached 1 in 4 steps.",                        type: "done"      },
    ],
  },

  nested: {
    label: "nested loops",
    desc: "Build a 3×3 multiplication table",
    code: [
      "let table = [];",
      "",
      "for (let i = 1; i <= 3; i++) {",
      "  let row = [];",
      "  for (let j = 1; j <= 3; j++) {",
      "    row.push(i * j);",
      "  }",
      "  table.push(row);",
      "}",
      "",
      "// [[1,2,3],[2,4,6],[3,6,9]]",
    ],
    steps: [
      { line: 1, vars: { table: "[]" },                                    msg: "Initialize empty table array",                    type: "assign",    changed: ["table"] },
      { line: 3, vars: { table: "[]", i: 1 },                              msg: "Outer loop: i = 1. Check i <= 3 → true",          type: "condTrue",  changed: ["i"] },
      { line: 4, vars: { table: "[]", i: 1, row: "[]" },                   msg: "Create empty row for i = 1",                      type: "assign",    changed: ["row"] },
      { line: 5, vars: { table: "[]", i: 1, row: "[]",    j: 1 },         msg: "Inner loop: j = 1. Check j <= 3 → true",          type: "condTrue",  changed: ["j"] },
      { line: 6, vars: { table: "[]", i: 1, row: "[1]",   j: 1 },         msg: "push(1×1=1) → row = [1]",                         type: "assign",    changed: ["row"] },
      { line: 5, vars: { table: "[]", i: 1, row: "[1]",   j: 2 },         msg: "j++ → j=2. Check j <= 3 → true",                  type: "condTrue",  changed: ["j"] },
      { line: 6, vars: { table: "[]", i: 1, row: "[1,2]", j: 2 },         msg: "push(1×2=2) → row = [1,2]",                       type: "assign",    changed: ["row"] },
      { line: 5, vars: { table: "[]", i: 1, row: "[1,2]", j: 3 },         msg: "j++ → j=3. Check j <= 3 → true",                  type: "condTrue",  changed: ["j"] },
      { line: 6, vars: { table: "[]", i: 1, row: "[1,2,3]", j: 3 },       msg: "push(1×3=3) → row = [1,2,3]",                     type: "assign",    changed: ["row"] },
      { line: 5, vars: { table: "[]", i: 1, row: "[1,2,3]", j: 4 },       msg: "j++ → j=4. Check j <= 3 → false. Exit inner.",    type: "condFalse", changed: ["j"] },
      { line: 8, vars: { table: "[[1,2,3]]", i: 1, row: "[1,2,3]", j: 4 },msg: "table.push(row) → table = [[1,2,3]]",              type: "assign",    changed: ["table"] },
      { line: 3, vars: { table: "[[1,2,3]]", i: 2 },                       msg: "i++ → i=2. Check i <= 3 → true",                  type: "condTrue",  changed: ["i"] },
      { line: 4, vars: { table: "[[1,2,3]]", i: 2, row: "[]" },            msg: "Create empty row for i = 2",                      type: "assign",    changed: ["row"] },
      { line: 5, vars: { table: "[[1,2,3]]", i: 2, row: "[]", j: 1 },     msg: "Inner loop: j = 1. Check j <= 3 → true",          type: "condTrue",  changed: ["j"] },
      { line: 6, vars: { table: "[[1,2,3]]", i: 2, row: "[2]", j: 1 },    msg: "push(2×1=2) → row = [2]",                         type: "assign",    changed: ["row"] },
      { line: 5, vars: { table: "[[1,2,3]]", i: 2, row: "[2]", j: 2 },    msg: "j++ → j=2. Check j <= 3 → true",                  type: "condTrue",  changed: ["j"] },
      { line: 6, vars: { table: "[[1,2,3]]", i: 2, row: "[2,4]", j: 2 },  msg: "push(2×2=4) → row = [2,4]",                       type: "assign",    changed: ["row"] },
      { line: 5, vars: { table: "[[1,2,3]]", i: 2, row: "[2,4]", j: 3 },  msg: "j++ → j=3. Check j <= 3 → true",                  type: "condTrue",  changed: ["j"] },
      { line: 6, vars: { table: "[[1,2,3]]", i: 2, row: "[2,4,6]", j: 3 },msg: "push(2×3=6) → row = [2,4,6]",                     type: "assign",    changed: ["row"] },
      { line: 5, vars: { table: "[[1,2,3]]", i: 2, row: "[2,4,6]", j: 4 },msg: "j++ → j=4. Exit inner loop.",                     type: "condFalse", changed: ["j"] },
      { line: 8, vars: { table: "[[1,2,3],[2,4,6]]", i: 2, row: "[2,4,6]", j: 4 }, msg: "table.push(row) → table = [[1,2,3],[2,4,6]]", type: "assign", changed: ["table"] },
      { line: 3, vars: { table: "[[1,2,3],[2,4,6]]", i: 3 },               msg: "i++ → i=3. Check i <= 3 → true",                  type: "condTrue",  changed: ["i"] },
      { line: 4, vars: { table: "[[1,2,3],[2,4,6]]", i: 3, row: "[]" },   msg: "Create empty row for i = 3",                      type: "assign",    changed: ["row"] },
      { line: 5, vars: { table: "[[1,2,3],[2,4,6]]", i: 3, row: "[]", j: 1 }, msg: "Inner loop: j = 1. Check j <= 3 → true",      type: "condTrue",  changed: ["j"] },
      { line: 6, vars: { table: "[[1,2,3],[2,4,6]]", i: 3, row: "[3]", j: 1 }, msg: "push(3×1=3) → row = [3]",                    type: "assign",    changed: ["row"] },
      { line: 5, vars: { table: "[[1,2,3],[2,4,6]]", i: 3, row: "[3]", j: 2 }, msg: "j++ → j=2. Check j <= 3 → true",             type: "condTrue",  changed: ["j"] },
      { line: 6, vars: { table: "[[1,2,3],[2,4,6]]", i: 3, row: "[3,6]", j: 2 }, msg: "push(3×2=6) → row = [3,6]",               type: "assign",    changed: ["row"] },
      { line: 5, vars: { table: "[[1,2,3],[2,4,6]]", i: 3, row: "[3,6]", j: 3 }, msg: "j++ → j=3. Check j <= 3 → true",          type: "condTrue",  changed: ["j"] },
      { line: 6, vars: { table: "[[1,2,3],[2,4,6]]", i: 3, row: "[3,6,9]", j: 3 }, msg: "push(3×3=9) → row = [3,6,9]",           type: "assign",    changed: ["row"] },
      { line: 5, vars: { table: "[[1,2,3],[2,4,6]]", i: 3, row: "[3,6,9]", j: 4 }, msg: "j++ → j=4. Exit inner loop.",           type: "condFalse", changed: ["j"] },
      { line: 8, vars: { table: "[[1,2,3],[2,4,6],[3,6,9]]", i: 3, row: "[3,6,9]", j: 4 }, msg: "table.push([3,6,9]) — complete!", type: "assign",   changed: ["table"] },
      { line: 3, vars: { table: "[[1,2,3],[2,4,6],[3,6,9]]", i: 4 },      msg: "i++ → i=4. Check i <= 3 → false. Exit outer.",    type: "condFalse", changed: ["i"] },
      { line: 11, vars: { table: "[[1,2,3],[2,4,6],[3,6,9]]", i: 4 },     msg: "All done! Multiplication table built.",             type: "done"      },
    ],
  },
};

// ─── Syntax highlighter ───────────────────────────────────────────────────────
const KW = new Set(["let","const","var","if","else","for","while","return","true","false","null","undefined","new"]);

function tokenize(line) {
  if (!line.trim()) return [{ t: line, k: "space" }];
  if (line.trim().startsWith("//")) return [{ t: line, k: "comment" }];
  const tokens = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === " ") { tokens.push({ t: " ", k: "space" }); i++; continue; }
    const q = line[i];
    if (q === '"' || q === "'") {
      let j = i + 1;
      while (j < line.length && line[j] !== q) j++;
      tokens.push({ t: line.slice(i, j + 1), k: "str" }); i = j + 1; continue;
    }
    if (/\d/.test(line[i]) && (i === 0 || !/\w/.test(line[i-1]))) {
      let j = i;
      while (j < line.length && /[\d.]/.test(line[j])) j++;
      tokens.push({ t: line.slice(i, j), k: "num" }); i = j; continue;
    }
    if (/[a-zA-Z_$]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[\w$]/.test(line[j])) j++;
      const w = line.slice(i, j);
      tokens.push({ t: w, k: KW.has(w) ? "kw" : "id" }); i = j; continue;
    }
    if (/[+\-*/%=!<>&|]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[+\-*/%=!<>&|]/.test(line[j])) j++;
      tokens.push({ t: line.slice(i, j), k: "op" }); i = j; continue;
    }
    tokens.push({ t: line[i], k: "punc" }); i++;
  }
  return tokens;
}

function tokColor(k) {
  return { kw: C.kwColor, str: C.strColor, num: C.numColor,
           comment: C.commentColor, op: C.opColor, id: C.text,
           punc: C.opColor, space: "transparent" }[k] || C.text;
}

// ─── Step metadata ────────────────────────────────────────────────────────────
function stepMeta(type) {
  const map = {
    assign:    { color: C.assign,    bg: C.assignBg,    label: "assign",    icon: "▪" },
    condTrue:  { color: C.condTrue,  bg: C.condTrueBg,  label: "true",      icon: "◆" },
    condFalse: { color: C.condFalse, bg: C.condFalseBg, label: "false",     icon: "◆" },
    done:      { color: C.done,      bg: C.doneBg,      label: "done",      icon: "●" },
  };
  return map[type] || map.assign;
}

// ─── Components ───────────────────────────────────────────────────────────────
function CodePanel({ code, activeLine, stepType }) {
  const activeRef = useRef(null);
  useEffect(() => { activeRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }); }, [activeLine]);

  const { color: activeColor } = activeLine ? stepMeta(stepType) : { color: C.accent };

  return (
    <div style={{ width: 320, flexShrink: 0, background: C.panel, borderRight: `1px solid ${C.border}`,
                  display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "10px 14px 9px", borderBottom: `1px solid ${C.border}`,
                    display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 11, color: C.muted, fontFamily: "monospace", letterSpacing: "0.04em" }}>
          code.js
        </span>
        <span style={{ marginLeft: "auto", fontSize: 10, color: C.dimmed, fontFamily: "monospace" }}>
          {code.length} lines
        </span>
      </div>
      <div style={{ overflowY: "auto", flex: 1, padding: "10px 0" }}>
        {code.map((line, idx) => {
          const lineNum = idx + 1;
          const isActive = activeLine === lineNum;
          const isEmpty = line.trim() === "";
          return (
            <div key={idx} ref={isActive ? activeRef : null}
              style={{
                display: "flex", alignItems: "stretch",
                background: isActive ? `${activeColor}14` : "transparent",
                borderLeft: isActive ? `2.5px solid ${activeColor}` : "2.5px solid transparent",
                transition: "background 0.2s, border-color 0.2s",
                minHeight: 22,
              }}>
              <span style={{ width: 36, flexShrink: 0, textAlign: "right", paddingRight: 12,
                             paddingTop: 2, fontSize: 11, fontFamily: "monospace",
                             color: isActive ? activeColor : C.lineNum,
                             userSelect: "none", transition: "color 0.2s" }}>
                {lineNum}
              </span>
              <span style={{ flex: 1, paddingTop: 2, paddingLeft: 2, paddingRight: 14,
                             fontSize: 13, fontFamily: "'Menlo','Consolas','Monaco',monospace",
                             lineHeight: 1.6, whiteSpace: "pre" }}>
                {isEmpty ? "\u00a0" : tokenize(line).map((tk, ti) => (
                  <span key={ti} style={{ color: tokColor(tk.k) }}>{tk.t}</span>
                ))}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepBadge({ type, small }) {
  const { color, label } = stepMeta(type);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: small ? "1px 5px" : "2px 7px",
      borderRadius: 3, border: `1px solid ${color}44`,
      background: `${color}12`,
      fontSize: small ? 9 : 10, fontFamily: "monospace",
      color, letterSpacing: "0.05em", fontWeight: 500,
      textTransform: "uppercase", flexShrink: 0,
    }}>
      {label}
    </span>
  );
}

function TracePanel({ steps, currentIndex, traceRef }) {
  const visibleSteps = steps.slice(0, currentIndex + 1);
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden",
                  borderBottom: `1px solid ${C.border}` }}>
      <div style={{ padding: "10px 14px 9px", borderBottom: `1px solid ${C.border}`,
                    display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 11, color: C.muted, letterSpacing: "0.04em" }}>EXECUTION TRACE</span>
        {currentIndex >= 0 && (
          <span style={{ marginLeft: "auto", fontSize: 10, color: C.dimmed, fontFamily: "monospace" }}>
            {currentIndex + 1} / {steps.length}
          </span>
        )}
      </div>
      <div ref={traceRef} style={{ overflowY: "auto", flex: 1, padding: "8px 0" }}>
        {currentIndex < 0 ? (
          <div style={{ padding: "28px 16px", textAlign: "center", color: C.dimmed, fontSize: 12 }}>
            Press <strong style={{ color: C.muted }}>Run</strong> or <strong style={{ color: C.muted }}>Step →</strong> to begin
          </div>
        ) : visibleSteps.map((step, idx) => {
          const isActive = idx === currentIndex;
          const { color, bg } = stepMeta(step.type);
          const age = currentIndex - idx;
          const opacity = age === 0 ? 1 : age === 1 ? 0.7 : age === 2 ? 0.5 : 0.3;
          return (
            <div key={idx} style={{
              display: "flex", alignItems: "flex-start", gap: 8,
              padding: "6px 14px",
              background: isActive ? bg : "transparent",
              opacity,
              transition: "opacity 0.3s, background 0.2s",
            }}>
              <span style={{ width: 18, textAlign: "center", paddingTop: 1,
                             fontSize: 10, fontFamily: "monospace", color: C.lineNum, flexShrink: 0 }}>
                {step.line}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 1 }}>
                  <StepBadge type={step.type} small />
                </div>
                <div style={{ fontSize: 12, color: isActive ? C.text : C.muted,
                              fontFamily: "monospace", lineHeight: 1.5,
                              transition: "color 0.2s", wordBreak: "break-word" }}>
                  {step.msg}
                </div>
              </div>
              {isActive && (
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: color,
                               flexShrink: 0, marginTop: 6,
                               boxShadow: `0 0 6px ${color}` }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VarsPanel({ vars, flashKeys }) {
  const entries = Object.entries(vars);
  return (
    <div style={{ background: C.panelAlt, borderTop: `1px solid ${C.border}` }}>
      <div style={{ padding: "8px 14px 7px", borderBottom: `1px solid ${C.border}` }}>
        <span style={{ fontSize: 11, color: C.muted, letterSpacing: "0.04em" }}>VARIABLES</span>
      </div>
      <div style={{ padding: "6px 12px 8px", display: "flex", flexWrap: "wrap", gap: "4px 8px", minHeight: 46 }}>
        {entries.length === 0 ? (
          <span style={{ fontSize: 11, color: C.dimmed, padding: "6px 2px" }}>No variables yet</span>
        ) : entries.map(([key, val]) => {
          const isFlash = flashKeys[key];
          return (
            <div key={key} style={{
              display: "flex", alignItems: "baseline", gap: 4,
              padding: "3px 8px", borderRadius: 3,
              background: isFlash ? `${C.accent}20` : C.panel,
              border: `1px solid ${isFlash ? C.accent + "55" : C.border}`,
              transition: "background 0.4s, border-color 0.4s",
            }}>
              <span style={{ fontSize: 11, color: C.kwColor, fontFamily: "monospace" }}>{key}</span>
              <span style={{ fontSize: 10, color: C.dimmed }}>=</span>
              <span style={{ fontSize: 11, color: isFlash ? C.accent : C.strColor,
                             fontFamily: "monospace", transition: "color 0.4s" }}>
                {String(val)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Controls({ isRunning, stepIndex, totalSteps, onRun, onPause, onStep, onReset, speed, onSpeedChange }) {
  const isFinished = stepIndex >= totalSteps - 1;
  const notStarted = stepIndex < 0;

  const btn = (label, onClick, opts = {}) => (
    <button onClick={onClick} disabled={opts.disabled}
      style={{
        padding: "5px 14px", borderRadius: 4, border: "1px solid",
        borderColor: opts.primary ? C.accent + "99" : C.border,
        background: opts.primary ? `${C.accent}18` : C.panel,
        color: opts.disabled ? C.dimmed : opts.primary ? C.accent : C.text,
        fontSize: 12, fontFamily: "inherit", cursor: opts.disabled ? "default" : "pointer",
        transition: "all 0.15s", letterSpacing: "0.01em",
        display: "flex", alignItems: "center", gap: 5,
      }}>
      {label}
    </button>
  );

  const pct = totalSteps > 0 ? Math.round(((stepIndex + 1) / totalSteps) * 100) : 0;

  return (
    <div style={{ background: C.panel, borderTop: `1px solid ${C.border}`,
                  padding: "0 14px", display: "flex", flexDirection: "column" }}>
      <div style={{ height: 2, background: C.border, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0,
                      width: `${pct}%`, background: C.accent,
                      transition: "width 0.3s ease" }} />
      </div>
      <div style={{ height: 48, display: "flex", alignItems: "center", gap: 6 }}>
        {!isRunning
          ? btn(isFinished ? "↺ Restart" : notStarted ? "▶ Run" : "▶ Continue",
                onRun, { primary: true })
          : btn("⏸ Pause", onPause, { primary: true })}
        {btn("→ Step", onStep, { disabled: isRunning || isFinished })}
        {btn("↺ Reset", onReset, { disabled: notStarted })}

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, color: C.dimmed }}>speed</span>
          <input type="range" min={150} max={1400} step={50}
            value={1550 - speed}
            onChange={e => onSpeedChange(1550 - Number(e.target.value))}
            style={{ width: 80, accentColor: C.accent, cursor: "pointer" }} />
          <span style={{ fontSize: 10, color: C.muted, fontFamily: "monospace", width: 44 }}>
            {speed < 400 ? "fast" : speed < 800 ? "normal" : "slow"}
          </span>
          <span style={{ fontSize: 10, color: C.dimmed, fontFamily: "monospace", marginLeft: 4 }}>
            {stepIndex < 0 ? "—" : `${stepIndex + 1}/${totalSteps}`}
          </span>
        </div>
      </div>
    </div>
  );
}

function Header({ programKey, onTabChange }) {
  return (
    <div style={{ background: C.panel, borderBottom: `1px solid ${C.border}`,
                  display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "11px 16px 0", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.text, letterSpacing: "-0.01em" }}>
          Control Flow Visualizer
        </span>
        <span style={{ fontSize: 11, color: C.dimmed, marginLeft: 4 }}>
          step-by-step execution
        </span>
      </div>
      <div style={{ display: "flex", gap: 0, padding: "0 12px", marginTop: 8 }}>
        {Object.entries(PROGRAMS).map(([key, prog]) => {
          const active = key === programKey;
          return (
            <button key={key} onClick={() => onTabChange(key)}
              style={{
                padding: "6px 13px", border: "none", borderBottom: active ? `2px solid ${C.accent}` : "2px solid transparent",
                background: "transparent", color: active ? C.text : C.muted,
                fontSize: 12, fontFamily: "inherit", cursor: "pointer",
                transition: "all 0.15s", letterSpacing: "0.01em",
                fontWeight: active ? 500 : 400,
              }}>
              {prog.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [programKey, setProgramKey] = useState("ifelse");
  const [stepIndex, setStepIndex]   = useState(-1);
  const [isRunning, setIsRunning]   = useState(false);
  const [speed, setSpeed]           = useState(750);
  const [flashKeys, setFlashKeys]   = useState({});

  const timerRef = useRef(null);
  const traceRef = useRef(null);

  const program = PROGRAMS[programKey];
  const isFinished = stepIndex >= program.steps.length - 1;

  const advance = useCallback(() => {
    setStepIndex(prev => {
      const next = prev + 1;
      if (next >= program.steps.length) { setIsRunning(false); return prev; }
      return next;
    });
  }, [program.steps.length]);

  useEffect(() => {
    if (isRunning) { timerRef.current = setInterval(advance, speed); }
    else { clearInterval(timerRef.current); }
    return () => clearInterval(timerRef.current);
  }, [isRunning, speed, advance]);

  // Flash changed variables
  useEffect(() => {
    if (stepIndex < 0) return;
    const changed = program.steps[stepIndex]?.changed;
    if (changed?.length) {
      const fk = {};
      changed.forEach(k => (fk[k] = true));
      setFlashKeys(fk);
      const t = setTimeout(() => setFlashKeys({}), 700);
      return () => clearTimeout(t);
    }
  }, [stepIndex, programKey]);

  // Auto-scroll trace to bottom
  useEffect(() => {
    if (traceRef.current) {
      traceRef.current.scrollTop = traceRef.current.scrollHeight;
    }
  }, [stepIndex]);

  const handleRun   = () => { if (isFinished) { handleReset(); setTimeout(() => setIsRunning(true), 50); return; } setIsRunning(true); };
  const handlePause = () => setIsRunning(false);
  const handleStep  = () => { setIsRunning(false); advance(); };
  const handleReset = () => { setIsRunning(false); setStepIndex(-1); setFlashKeys({}); };

  const handleTab = (key) => {
    setIsRunning(false); setStepIndex(-1); setFlashKeys({}); setProgramKey(key);
  };

  const currentStep = stepIndex >= 0 ? program.steps[stepIndex] : null;

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${C.bg}; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: ${C.borderLight}; }
        button:hover:not(:disabled) { opacity: 0.85; }
      `}</style>
      <div style={{ background: C.bg, color: C.text, height: "100vh", minHeight: 520,
                    display: "flex", flexDirection: "column", overflow: "hidden",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" }}>
        <Header programKey={programKey} onTabChange={handleTab} />
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          <CodePanel
            code={program.code}
            activeLine={currentStep?.line}
            stepType={currentStep?.type}
          />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <TracePanel steps={program.steps} currentIndex={stepIndex} traceRef={traceRef} />
            <VarsPanel vars={currentStep?.vars || {}} flashKeys={flashKeys} />
          </div>
        </div>
        <Controls
          isRunning={isRunning}
          stepIndex={stepIndex}
          totalSteps={program.steps.length}
          onRun={handleRun}
          onPause={handlePause}
          onStep={handleStep}
          onReset={handleReset}
          speed={speed}
          onSpeedChange={setSpeed}
        />
      </div>
    </>
  );
}
