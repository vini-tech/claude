// Hook Stop: antes de o agente encerrar, confere o projeto se algo mudou em web/, tests/ ou verificador/.
// Falhou → exit 2: o Claude Code devolve a mensagem ao agente e ele continua até corrigir.
// Com stop_hook_active (o agente já está continuando por causa deste hook) não bloqueia de novo, para não entrar em laço.
const { execFileSync, spawnSync } = require("child_process");
const path = require("path");

const raiz = process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, "..", "..");
let entrada = {};
try { entrada = JSON.parse(require("fs").readFileSync(0, "utf8") || "{}"); } catch (e) {}
if (entrada.stop_hook_active) process.exit(0);

let mudou = "";
try {
  mudou = execFileSync("git", ["status", "--porcelain", "--", "web", "tests", "verificador"], { cwd: raiz, encoding: "utf8" }).trim();
} catch (e) { process.exit(0); }
if (!mudou) process.exit(0);

const problemas = [];
const val = spawnSync("node", ["tests/validar_temas.js"], { cwd: raiz, encoding: "utf8", timeout: 240000 });
const saida = (val.stdout || "").trim();
if (val.status !== 0 || saida !== "[]") {
  problemas.push("node tests/validar_temas.js não imprimiu []:\n" + (saida + "\n" + (val.stderr || "")).trim().slice(0, 3000));
}
const py = spawnSync("python", ["-m", "pytest", "-q", "-x"], { cwd: raiz, encoding: "utf8", timeout: 240000 });
if (py.status !== 0) {
  problemas.push("python -m pytest -q falhou:\n" + ((py.stdout || "") + (py.stderr || "")).trim().split("\n").slice(-40).join("\n"));
}
if (problemas.length) {
  process.stderr.write("Verificação do projeto falhou (hook .claude/hooks/verificar.js). Corrija antes de encerrar; "
    + "se o problema não for seu (outro autor, outro capítulo), diga isso ao usuário em vez de mexer.\n\n" + problemas.join("\n\n"));
  process.exit(2);
}
process.exit(0);
