"""Segundo verificador das cifras: o music21 monta cada acorde do livro, sem passar pelo motor JS.

tests/coletar_cifras.js junta cada cifra (exemplos, contrastes, quebras, perguntas e soluções, inclusive
as transpostas do "tom do dia") com o tom em que ela é lida e as notas da partitura. Aqui o music21
(roman.RomanNumeral) monta o acorde e confere três coisas:
  1. as notas do acorde, com grafia, são as mesmas que web/regras3.js (membros) calcula;
  2. o baixo da partitura é o baixo que a cifra pede (I6: a 3ª; V43: a 5ª…);
  3. a melodia no ataque do baixo é nota do acorde.
2 e 3 também estão em cifras_coerentes (JS); aqui são refeitas com outra implementação, de modo que um
erro no motor JS não esconda um erro no livro.
"""

import json
import re
import shutil
import subprocess
from collections import defaultdict
from functools import lru_cache
from pathlib import Path

import pytest

music21 = pytest.importorskip("music21")
from music21 import key, roman  # noqa: E402

RAIZ = Path(__file__).parent.parent
pytestmark = pytest.mark.skipif(shutil.which("node") is None, reason="node não instalado")


@pytest.fixture(scope="module")
def registros():
    r = subprocess.run(["node", str(RAIZ / "tests" / "coletar_cifras.js")],
                       capture_output=True, text=True, encoding="utf-8", check=True)
    saida = json.loads(r.stdout)
    # partitura que o coletor não leu sairia da conferência sem aviso
    assert saida["erros"] == []
    return saida["registros"]


def figura_m21(cifra: str) -> str:
    # "N" sozinho é a napolitana em estado fundamental; para o music21, "N" já é N6.
    # O resto (°, ø, +, figuras com barra, /V) o music21 lê na mesma grafia do ateliê.
    return "N53" if cifra == "N" else cifra


# as mesmas figuras de 7ª que regras3.lerCifra aceita (V9 alterado não aparece no livro e não é tratado)
ALTERADA_COM_SETIMA = re.compile(r"^([b#])([ivIV]+)(\+)?(7|65|6/5|43|4/3|42|4/2|2)$")
MEMBRO_NO_BAIXO = {"7": 0, "65": 1, "43": 2, "42": 3, "2": 3}


@lru_cache(maxsize=None)
def acorde(cifra: str, tonica: str, menor: bool):
    """(notas com grafia, baixo) segundo o music21.

    Duas convenções do ateliê que o music21 lê de outro jeito, e que por isso vão explícitas aqui:
    - No menor, b e # alteram o grau da escala natural (#viø7 em mi menor = dó♯-mi-sol-si); o music21
      por padrão já sobe o 6º e o 7º graus pela qualidade, e o # subiria duas vezes.
    - Acorde de fundamental alterada com 7ª (bVII7, bII7, bVI7…) tem 7ª menor, como uma dominante; o
      music21 tiraria a 7ª da escala do tom (bVII7 em sol maior daria fá-lá-dó-mi).
    """
    k = key.Key(tonica.lower() if menor else tonica, "minor" if menor else "major")
    opcoes = {}
    if menor and cifra.startswith(("b", "#")):
        opcoes = dict(sixthMinor=roman.Minor67Default.FLAT, seventhMinor=roman.Minor67Default.FLAT)
    m = ALTERADA_COM_SETIMA.match(cifra)
    if m:
        triade = roman.RomanNumeral(m[1] + m[2] + (m[3] or ""), k, **opcoes)
        notas = [p.name for p in triade.pitches] + [triade.root().transpose("m7").name]
        return frozenset(notas), notas[MEMBRO_NO_BAIXO[m[4].replace("/", "")]]
    rn = roman.RomanNumeral(figura_m21(cifra), k, **opcoes)
    return frozenset(p.name for p in rn.pitches), rn.bass().name


def ler(leitura):
    t = leitura["tom"]
    return acorde(leitura["cifra"], t["tonica"], t["menor"])


def nome_tom(t):
    return f"{t['tonica'].replace('-', 'b')} {'menor' if t['menor'] else 'maior'}"


def test_coleta_cobre_o_livro(registros):
    # o livro tem milhares de acordes cifrados e quase cem cifras diferentes; se a coleta encolher, algo quebrou nela
    cifras = {l["cifra"] for r in registros for l in r["leituras"]}
    assert len(registros) > 3000
    assert len(cifras) > 80


def test_music21_le_todas_as_cifras(registros):
    falhas = set()
    for r in registros:
        for l in r["leituras"]:
            try:
                ler(l)
            except Exception as e:  # noqa: BLE001 - qualquer recusa do music21 é uma falha a relatar
                falhas.add(f"{l['cifra']} em {nome_tom(l['tom'])}: {e}")
    assert sorted(falhas) == []


def test_acordes_iguais_no_js_e_no_music21(registros):
    """A leitura de web/regras3.js (notas e baixo) é a mesma do music21, com a mesma grafia."""
    divergencias = defaultdict(list)
    for r in registros:
        for l in r["leituras"]:
            notas, baixo = ler(l)
            js = frozenset(l["js"])
            if js != notas or l["jsBaixo"] != baixo:
                chave = (f"{l['cifra']} em {nome_tom(l['tom'])}: JS {'-'.join(l['js'])} (baixo {l['jsBaixo']}), "
                         f"music21 {'-'.join(sorted(notas))} (baixo {baixo})")
                divergencias[chave].append(r["onde"])
    assert {k: v[:3] for k, v in divergencias.items()} == {}


def test_partituras_batem_com_as_cifras(registros):
    """O baixo é o membro que a cifra pede e a melodia no ataque do baixo é nota do acorde.

    A melodia só é conferida onde o perfil tem cifras_coerentes como erro: os capítulos de ornamentos,
    retardos e sextas aumentadas a desligam, porque lá a nota no ataque pode ser de fora do acorde."""
    problemas = []
    for r in registros:
        lidos = [ler(l) for l in r["leituras"]]
        notas = frozenset().union(*(n for n, _ in lidos))
        baixos = {b for _, b in lidos}
        if r["baixo"] not in baixos:
            problemas.append(f"{r['onde']}: {r['texto']} pede {' ou '.join(sorted(baixos))} no baixo, e o baixo tem {r['baixo']}")
        if r["melodiaConta"] and r["melodia"] and r["melodia"] not in notas:
            problemas.append(f"{r['onde']}: {r['melodia']} na melodia não pertence a {r['texto']} ({'-'.join(sorted(notas))})")
    assert problemas == []
