const CONDUCT_RULES = Object.freeze([
  {
    code: "evaluation-manipulation",
    patterns: [
      /採点者への命令/u,
      /(?:これまで|以前|上記)の指示を無視/u,
      /(?:全評価|採点|評価|点数).{0,12}(?:100点|満点|最高点)/u,
      /(?:総評|回答|出力).{0,12}(?:先頭|冒頭).{0,20}(?:出力|記載|表示)/u,
      /(?:system|developer|prompt).{0,12}(?:instruction|message|指示).{0,12}(?:ignore|無視)/iu,
    ],
  },
  {
    code: "harassment-or-threat",
    patterns: [
      /(?:馬鹿|バカ|無能|役立たず|クズ)/u,
      /(?:クビ|解雇|晒す|報復).{0,16}(?:する|しろ|される)/u,
      /(?:殺す|死ね|消えろ)/u,
    ],
  },
]);

function collectAnswerText(attempt) {
  return [
    attempt?.answer?.subject,
    ...Object.values(attempt?.answer?.sections || {}),
    ...Object.values(attempt?.evidenceDescriptions || {}),
  ].filter((value) => typeof value === "string" && value.trim()).join("\n");
}

export function evaluateProfessionalConduct(attempt) {
  const text = collectAnswerText(attempt);
  const reasons = [];
  for (const rule of CONDUCT_RULES) {
    const matchedPattern = rule.patterns.find((pattern) => pattern.test(text));
    if (matchedPattern) reasons.push(rule.code);
  }
  return {
    blocked: reasons.length > 0,
    reasons,
  };
}

export { CONDUCT_RULES };
