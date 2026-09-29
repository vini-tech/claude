"""A versão web (web/motor.js) tem que dar exatamente os mesmos resultados que o Python."""

import json
import random
import shutil
import subprocess
from pathlib import Path

import pytest

from verificador import NIVEIS, TABELA, ler_texto, verificar

RAIZ = Path(__file__).parent.parent
EXEMPLOS = RAIZ / "exercicios" / "exemplos"

pytestmark = pytest.mark.skipif(shutil.which("node") is None, reason="node não instalado")

SCRIPT_NODE = """
const M = require(process.argv[1]);
const casos = JSON.parse(require('fs').readFileSync(0, 'utf8'));
const saida = casos.map(([texto, nivel]) => {
  try {
    const r = M.verificar(M.lerTexto(texto), nivel);
    return r.achados.map(a => [a.severidade, a.regra, a.compasso]);
  } catch (e) { return 'erro: ' + e.message; }
});
process.stdout.write(JSON.stringify({saida, tabela: M.TABELA, niveis: M.NIVEIS}));
"""


def rodar_node(casos):
    r = subprocess.run(
        ["node", "-e", SCRIPT_NODE, str(RAIZ / "web" / "motor.js")],
        input=json.dumps(casos), capture_output=True, text=True, check=True,
    )
    return json.loads(r.stdout)


def rodar_python(texto, nivel):
    try:
        r = verificar(ler_texto(texto), nivel)
    except Exception as e:  # noqa: BLE001
        return "erro: " + str(e)
    return [[s, a.regra, a.compasso] for s, a in r.achados]


def exercicio_aleatorio(rng: random.Random) -> str:
    n_vozes = rng.choice([2, 2, 3, 4])
    compasso = rng.choice(["4/4", "2/2", "3/4"])
    dur_compasso = {"4/4": 4, "2/2": 4, "3/4": 3}[compasso]
    n_compassos = rng.randint(3, 8)
    linhas = [f"compasso: {compasso}"]
    if rng.random() < 0.7:
        linhas.append("tom: " + rng.choice(["C maior", "a menor", "D dorico", "G maior", "F maior", "E frigio"]))
    nomes = ["soprano", "contralto", "tenor", "baixo"] if n_vozes == 4 else [f"v{i}" for i in range(n_vozes)]
    if rng.random() < 0.5:
        linhas.append(f"cf: {nomes[-1] if rng.random() < 0.5 else nomes[0]}")
    anterior = None
    for k, nome in enumerate(nomes):
        if anterior and rng.random() < 0.3:
            # voz que anda em 3ªs ou 6ªs paralelas com a de cima
            desloc = rng.choice([3, 4, 8, 9])
            toks = [_transpor_token(tok, -desloc) for tok in anterior]
            linhas.append(f"{nome}: " + " ".join(toks))
            anterior = toks
            continue
        centro = 72 - k * 7
        t, toks = 0, []
        ps = centro
        while t < dur_compasso * n_compassos:
            d = rng.choice([4, 2, 2, 1, 1, 1, 0.5]) if rng.random() < 0.6 else dur_compasso
            d = min(d, dur_compasso * n_compassos - t)
            if rng.random() < 0.08:
                toks.append(f"P/{d:g}")
            else:
                ps = max(40, min(84, ps + rng.choice([-14, -7, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 8, 12, 15])))
                nome_nota = NOMES[ps % 12] + str(ps // 12 - 1)
                toks.append(f"{nome_nota}/{d:g}" + ("~" if rng.random() < 0.1 else ""))
            t += d
        linhas.append(f"{nome}: " + " ".join(toks))
        anterior = toks
    return "\n".join(linhas) + "\n"


NOMES = "C C# D Eb E F F# G Ab A Bb B".split()


def _transpor_token(tok: str, semitons: int) -> str:
    if tok.startswith("P/"):
        return tok
    alt, resto = tok.split("/", 1)
    from music21 import pitch
    ps = int(pitch.Pitch(alt.replace("b", "-") if len(alt) > 2 else alt).ps) + semitons
    return f"{NOMES[ps % 12]}{ps // 12 - 1}/{resto}"


def test_tabela_e_niveis_iguais():
    js = rodar_node([])
    assert {k: v.split() for k, v in js["tabela"].items()} == {k: v.split() for k, v in TABELA.items()}
    assert [(n["numero"], n["nome"], n["soExternas"]) for n in js["niveis"]] == \
        [(n.numero, n.nome, n.so_externas) for n in NIVEIS]


def test_exemplos_iguais_em_todos_os_niveis():
    casos = [(f.read_text(encoding="utf-8"), n)
             for f in sorted(EXEMPLOS.glob("*.txt")) for n in range(1, 11)]
    js = rodar_node(casos)["saida"]
    for (texto, nivel), resultado_js in zip(casos, js):
        assert resultado_js == rodar_python(texto, nivel), (nivel, texto[:60])


def test_exercicios_aleatorios_iguais():
    rng = random.Random(1725)  # ano do Gradus ad Parnassum
    casos = [(exercicio_aleatorio(rng), rng.randint(1, 10)) for _ in range(400)]
    js = rodar_node(casos)["saida"]
    diferencas = [(n, t) for (t, n), r in zip(casos, js) if r != rodar_python(t, n)]
    assert not diferencas, diferencas[0]


def test_exemplos_js_atualizado():
    import importlib.util
    spec = importlib.util.spec_from_file_location("gerar", RAIZ / "web" / "gerar_exemplos.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    assert (RAIZ / "web" / "exemplos.js").read_text(encoding="utf-8") == mod.gerar(), \
        "rode: python web/gerar_exemplos.py"
