// Hook PreToolUse do subagente autor-capitulo: Edit/Write só dentro de web/livro/ (docs/guia-capitulos.md, "Onde escrever").
const path = require("path");

const raiz = path.resolve(process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, "..", ".."));
let entrada = {};
try { entrada = JSON.parse(require("fs").readFileSync(0, "utf8") || "{}"); } catch (e) {}
const ti = entrada.tool_input || {};
const alvo = ti.file_path || ti.path || ti.notebook_path;
if (!alvo) process.exit(0);

const livro = path.join(raiz, "web", "livro") + path.sep;
const abs = path.resolve(raiz, alvo);
if (abs.toLowerCase().startsWith(livro.toLowerCase())) process.exit(0);

process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: "PreToolUse",
    permissionDecision: "deny",
    permissionDecisionReason: `O autor de capítulo só escreve em web/livro/. "${alvo}" fica fora: se precisar de mudança nele, descreva-a no relatório final para o coordenador.`,
  },
}));
process.exit(0);
