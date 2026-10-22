"""Relatório de estilo (web/estilo.js): as medidas novas de ritmo, harmonia, melodia e forma.

O nPVI é conferido contra o do music21 (analysis.patel), uma implementação independente.
"""

import json
import shutil
import subprocess
from pathlib import Path

import pytest

RAIZ = Path(__file__).parent.parent
pytestmark = pytest.mark.skipif(shutil.which("node") is None, reason="node não instalado")

SCRIPT = """
const M = require(process.argv[1]);
const Est = require(process.argv[2]);
const casos = JSON.parse(require('fs').readFileSync(0, 'utf8'));
const md = Est.medidas;
const saida = casos.map(([tipo, texto, extra]) => {
  const ex = M.lerTexto(texto);
  const v = ex.vozes[0];
  if (tipo === 'npvi') return md.nPVI(v);
  if (tipo === 'contorno') return md.contorno(v.notas);
  if (tipo === 'afastamentos') return md.afastamentos(v).length;
  if (tipo === 'forma') return md.formaPorCompasso(ex, v).join(' ');
  if (tipo === 'complementar') return md.complementaridade(ex, ex.vozes[0], ex.vozes[1]);
  if (tipo === 'fundamentais') return md.fundamentais(md.acordes(ex, extra.split(' ')));
  if (tipo === 'cadencia') return md.cadenciaEm(ex, md.acordes(ex, extra.cifras.split(' ')), extra.c);
  if (tipo === 'relatorio') return Est.relatorio(ex, extra).map((i) => [i.grupo, i.titulo]);
  if (tipo === 'relatorio_nivel') return Object.fromEntries(Est.relatorio(ex, extra).map((i) => [i.titulo, i.nivel]));
});
process.stdout.write(JSON.stringify(saida));
"""


def medir(*casos):
    entrada = [[tipo, texto, extra] for tipo, texto, extra in casos]
    r = subprocess.run(["node", "-e", SCRIPT, str(RAIZ / "web" / "motor.js"), str(RAIZ / "web" / "estilo.js")],
                       input=json.dumps(entrada), capture_output=True, text=True, encoding="utf-8", check=True)
    return json.loads(r.stdout)


def uma(notas):
    return f"tom: C maior\nmelodia: {notas}"


def duas(cima, baixo):
    return f"tom: C maior\nsoprano: {cima}\nbaixo: {baixo}"


def test_npvi_igual_ao_do_music21():
    music21 = pytest.importorskip("music21")
    from music21 import analysis, converter

    ritmos = ["C4/1 D4/1 E4/1 F4/1", "C4/1 D4/0.5 C4/1 D4/0.5 C4/1", "C4/1.5 D4/0.5 E4/2 F4/0.75 G4/0.25 A4/1 G4/4"]
    js = medir(*[("npvi", uma(r), None) for r in ritmos])
    for r, valor in zip(ritmos, js):
        tiny = " ".join(f"{n[0].lower()}{ {4: '1', 2: '2', 1.5: '4.', 1: '4', 0.75: '8.', 0.5: '8', 0.25: '16'}[float(n.split('/')[1])] }" for n in r.split())
        s = converter.parse(f"tinynotation: 4/4 {tiny}").flatten().notesAndRests.stream()
        assert valor == pytest.approx(analysis.patel.nPVI(s))


def test_contorno_de_huron():
    assert medir(
        ("contorno", uma("C5/1 E5/1 G5/1 E5/1 C5/1"), None),
        ("contorno", uma("G5/1 E5/1 C5/1 E5/1 G5/1"), None),
        ("contorno", uma("C5/1 E5/1 G5/1 B5/1 D6/1"), None),
        ("contorno", uma("C5/1 C5/1 C5/1 C5/1"), None),
    ) == ["convexo (arco)", "côncavo", "ascendente", "horizontal"]


def test_afastamento_no_extremo_do_registro():
    # âmbito dó5–dó6; os 15% de cima começam em lá♯5. A linha já esteve em si5, volta a ele e sobe a dó6: 1.
    # O arco que sobe por grau ao clímax e desce ao dó final não conta (primeira chegada e nota final): 0.
    assert medir(
        ("afastamentos", uma("C5/1 E5/1 B5/1 A5/1 B5/1 C6/1 G5/1 E5/1 C5/1"), None),
        ("afastamentos", uma("E5/1 F5/1 G5/1 A5/1 B5/1 C6/1 A5/1 F5/1 E5/1 D5/1 C5/1"), None),
    ) == [1, 0]


def test_forma_compasso_a_compasso():
    # c. 2 repete o c. 1 um grau acima; c. 3 é novo; c. 4 tem o ritmo do c. 1 com outro desenho
    assert medir(("forma", uma("C5/1 D5/1 E5/2 D5/1 E5/1 F5/2 G5/4 E5/1 C5/1 D5/2"), None)) == ["a a b a′"]
    # a repetição transposta de uma variação continua variação (a′ a′); a semibreve que segue outra não
    # "repete" (não tem intervalos), só varia pelo ritmo (b b′)
    assert medir(("forma", uma("C5/1 E5/1 G5/2 E5/1 D5/1 C5/2 F5/1 E5/1 D5/2 G5/4 E5/4"), None)) == ["a a′ a′ b b′"]


def test_ritmo_complementar():
    # vozes que se revezam nunca atacam juntas (0); vozes em bloco atacam juntas o tempo todo (1 com p = 1)
    assert medir(
        ("complementar", duas("C5/1 P/1 E5/1 P/1", "P/1 C3/1 P/1 G2/1"), None),
        ("complementar", duas("C5/1 D5/1 E5/1 F5/1", "C3/1 B2/1 A2/1 G2/1"), None),
    ) == [0, 1]


def test_fundamentais_e_cadencias():
    texto = duas("E5/2 F5/2 D5/2 C5/2", "C3/2 F3/2 G2/2 C3/2")
    assert medir(
        # I → IV não conta (saída da tônica); IV → V (2ª acima) e V → I (5ª abaixo): 2 de 2
        ("fundamentais", texto, "I IV V I"),
        ("cadencia", texto, {"cifras": "I IV V I", "c": 2}),
        ("cadencia", duas("E5/2 F5/2 D5/2 E5/2", "C3/2 F3/2 G2/2 C3/2"), {"cifras": "I IV V I", "c": 2}),
        ("cadencia", duas("E5/2 F5/2 D5/4", "C3/2 F3/2 G2/4"), {"cifras": "I IV V", "c": 2}),
        ("cadencia", duas("E5/2 F5/2 D5/2 C5/2", "C3/2 F3/2 G2/2 A2/2"), {"cifras": "I IV V vi", "c": 2}),
        # as saídas do I não contam (I → V); V → I conta: 1 de 1
        ("fundamentais", duas("E5/2 D5/2 C5/4", "C3/2 G2/2 C3/4"), "I V I"),
        # IV → vii°6 é 5ª abaixo em graus (fá → si, trítono): "dominante"
        ("fundamentais", duas("C5/2 D5/2 C5/4", "F3/2 D3/2 E3/4"), "IV vii°6 I6"),
        # apojatura na melodia sobre o I final: continua PAC
        ("cadencia", duas("E5/2 F5/2 E5/2 D5/2 D5/2 C5/2", "C3/2 F3/2 G2/2 G2/2 C3/4"), {"cifras": "I IV I64 V I", "c": 3}),
        # V6 no fim da frase não é semicadência
        ("cadencia", duas("E5/2 F5/2 D5/4", "C3/2 F3/2 B2/4"), {"cifras": "I IV V6", "c": 2}),
    ) == [{"dom": 2, "total": 2}, "PAC", "IAC", "SC", "engano", {"dom": 1, "total": 1}, {"dom": 2, "total": 2}, "PAC", None]


def test_referencias_em_dia_com_o_livro():
    """web/referencias-estilo.js é gerado das soluções; se uma solução mudar, recalibre com
    `node tests/calibrar_estilo.js --gravar`."""
    r = subprocess.run(["node", str(RAIZ / "tests" / "calibrar_estilo.js")], capture_output=True, text=True, encoding="utf-8", check=True)
    gravado = (RAIZ / "web" / "referencias-estilo.js").read_text(encoding="utf-8")
    assert r.stdout.replace("\r\n", "\n") == gravado.replace("\r\n", "\n")


def test_faixa_do_livro_tira_a_atencao_dentro_dela():
    # baixo com clímax a 20% da linha: pelo critério fixo, "atenção"; no nível 2 o livro vai de 0% a 80%
    texto = duas("E5/2 F5/2 G5/2 F5/2 E5/2 D5/2 D5/2 C5/2", "C3/2 E3/2 D3/2 C3/2 B2/2 C3/2 G2/2 C3/2")
    sem, com = medir(("relatorio_nivel", texto, {"cf": 0}), ("relatorio_nivel", texto, {"cf": 0, "nivelLivro": 2}))
    assert sem["Clímax (baixo)"] == "atencao"
    assert com["Clímax (baixo)"] == "ok"


def test_grupos_do_relatorio():
    itens = medir(("relatorio", duas("E5/1 D5/0.5 C5/0.5 F5/2 E5/1 D5/1 B4/2 E5/1 D5/0.5 C5/0.5 G5/2 D5/2 C5/2",
                                     "C3/2 A2/2 F2/2 G2/2 C3/2 E3/2 G2/2 C3/2"),
                   {"cf": -1, "cifras": "I vi IV V I I6 V I".split(), "plano": {"cadencia": 4}}))[0]
    assert {g for g, _ in itens} >= {"Melodia", "Ritmo", "Vozes", "Harmonia", "Forma"}
    assert ["Harmonia", "Cadências"] in itens
