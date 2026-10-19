"""Regras de condução com cifras (web/regras3.js): 7ª, sensível, sexta aumentada e napolitana.

Cada caso é uma passagem a duas vozes com cifras (uma por nota do baixo) e a regra isolada no perfil;
o teste confere quais regras acusam.
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
require(process.argv[2]);
const casos = JSON.parse(require('fs').readFileSync(0, 'utf8'));
const saida = casos.map(([texto, cifras, regras, plano]) => {
  const ex = M.lerTexto(texto);
  const perfil = Object.fromEntries(regras.map((r) => [r, 'erro']));
  const r = M.verificarPerfil(ex, perfil, { cifras: cifras.split(' '), plano: plano || {} });
  return [...new Set(r.achados.map((a) => a.regra))].sort();
});
process.stdout.write(JSON.stringify(saida));
"""


def acusa(*casos):
    entrada = [[texto, cifras, regras, plano] for texto, cifras, regras, plano in casos]
    r = subprocess.run(["node", "-e", SCRIPT, str(RAIZ / "web" / "motor.js"), str(RAIZ / "web" / "regras3.js")],
                       input=json.dumps(entrada), capture_output=True, text=True, encoding="utf-8", check=True)
    return json.loads(r.stdout)


def duas(tom, cima, baixo):
    return f"tom: {tom}\nsoprano: {cima}\nbaixo: {baixo}"


SETIMA = ["set_setima"]
SENSIVEL = ["sensivel_sobe", "sensivel_frustrada"]


def test_setima_desce_e_licenca_do_v43():
    assert acusa(
        # V7 → I: fá5 → mi5 (desce), fá5 → sol5 (sobe), fá5 → dó5 (salta)
        (duas("C maior", "F5/2 E5/2", "G2/2 C3/2"), "V7 I", SETIMA, None),
        (duas("C maior", "F5/2 G5/2", "G2/2 C3/2"), "V7 I", SETIMA, None),
        (duas("C maior", "F5/2 C5/2", "G2/2 C3/2"), "V7 I", SETIMA, None),
        # V43 → I6 com o baixo subindo: a 7ª pode subir em 10ªs
        (duas("C maior", "F4/2 G4/2", "D3/2 E3/2"), "V43 I6", SETIMA, None),
        # 7ª que desce por semitom cromático (V7 → bV7 do cromatismo linear)
        (duas("C maior", "F5/2 E-5/2", "G2/2 F2/2"), "V7 bVII42", SETIMA, None),
    ) == [[], SETIMA, SETIMA, [], []]


def test_sensivel_no_baixo_e_na_cadencia():
    assert acusa(
        # V6 → I: o baixo sobe da sensível à tônica; descer é erro
        (duas("C maior", "D5/2 C5/2", "B2/2 C3/2"), "V6 I", SENSIVEL, None),
        (duas("C maior", "D5/2 E5/2", "B2/2 A2/2"), "V6 I6", SENSIVEL, None),
        # cadência final V → I: a sensível na voz de cima sobe
        (duas("C maior", "B4/2 C5/2", "G2/2 C3/2"), "V I", SENSIVEL, None),
        (duas("C maior", "B4/2 G4/2", "G2/2 C3/2"), "V I", SENSIVEL, None),
        # no meio da frase, a sensível que salta na voz de cima é só aviso (sensivel_frustrada)
        (duas("C maior", "B4/2 G4/2 A4/2 B4/2 C5/4", "G2/2 C3/2 F2/2 G2/2 C3/4"), "V I IV V I", SENSIVEL, None),
    ) == [[], ["sensivel_sobe"], [], ["sensivel_sobe"], ["sensivel_frustrada"]]


def test_sensivel_excecoes():
    assert acusa(
        # V6 → vi (I–V6–vi): na cadência de engano o baixo desce na escala
        (duas("C maior", "C5/2 D5/2 C5/2", "C3/2 B2/2 A2/2"), "I V6 vi", SENSIVEL, None),
        # cadeia de dominantes: dó♯ (sensível do V7/ii) desce a dó, 7ª do V7/V
        (duas("C maior", "C#5/2 C5/2 B4/2", "A2/2 D3/2 G2/2"), "V7/ii V7/V V7", SENSIVEL, None),
        # V6 → I6/4 cadencial: a obrigação passa para o V
        (duas("A menor", "B4/2 C5/2 B4/2 A4/2", "G#2/2 E3/2 E2/2 A2/2"), "V6 i64 V i", SENSIVEL, None),
        # fim da semicadência: a frase termina no V, a sensível não resolve no começo da seguinte
        (duas("C maior", "E5/2 D5/2 B4/4 G4/4", "C3/2 F3/2 G2/4 C3/4"), "I IV V I", SENSIVEL, {"semicadencia": 2}),
        # o mesmo sem semicadência no plano: V → I final é cadência e a sensível tem de subir
        (duas("C maior", "E5/2 D5/2 B4/4 G4/4", "C3/2 F3/2 G2/4 C3/4"), "I IV V I", SENSIVEL, None),
    ) == [[], [], [], [], ["sensivel_sobe"]]


def test_sensivel_dobrada_so_no_ataque():
    regra = ["sensivel_dupla"]
    assert acusa(
        (duas("C maior", "B4/2 C5/2", "B2/2 C3/2"), "V6 I", regra, None),
        # si4 de passagem no meio do V6, depois do ataque com ré5
        (duas("C maior", "D5/1 B4/1 C5/2", "B2/2 C3/2"), "V6 I", regra, None),
    ) == [regra, []]


def test_sexta_aumentada_e_napolitana():
    aum, nap = ["aumentada_resolve"], ["napolitana_resolve"]
    assert acusa(
        # It6 → V em lá menor: ré♯ sobe a mi e fá desce a mi
        (duas("A menor", "D#5/2 E5/2", "F2/2 E2/2"), "It6 V", aum, None),
        (duas("A menor", "D#5/2 C5/2", "F2/2 E2/2"), "It6 V", aum, None),
        # N6 → V em lá menor: si♭ desce (à sensível); subir é erro
        (duas("A menor", "B-4/2 G#4/2", "D3/2 E3/2"), "N6 V", nap, None),
        (duas("A menor", "B-4/2 C5/2", "D3/2 E3/2"), "N6 V", nap, None),
        # napolitana em estado fundamental: o si♭ no baixo salta ao 5º grau
        (duas("A menor", "F5/2 E5/2", "B-2/2 E2/2"), "N V", nap, None),
    ) == [[], aum, [], nap, []]


def test_setima_casos_do_revisor():
    assert acusa(
        # 7ª repetida ou ligada sobre o I, como um 4–3, e descendo dentro dele
        (duas("C maior", "F5/2 F5/1 E5/1", "G2/2 C3/2"), "V7 I", SETIMA, None),
        (duas("C maior", "D5/1 F5/2 E5/1", "G2/2 C3/2"), "V7 I", SETIMA, None),
        # presa até o fim do I: continua erro
        (duas("C maior", "F5/2 F5/2", "G2/2 C3/2"), "V7 I", SETIMA, None),
        # vii°7/V → I6/4 no maior: mi♭ sobe a mi, 3ª do I6/4
        (duas("C maior", "E-5/2 E5/1 D5/1 C5/4", "F#2/2 G2/1 G2/1 C3/4"), "vii°7/V I64 V I", SETIMA, None),
    ) == [[], [], SETIMA, []]


IDEIA = "C5/1.5 E5/0.5 G5/2 F5/1.5 E5/0.5 D5/2"            # c. 1–2: a ideia básica do livro
NA_DOMINANTE = "B4/1.5 D5/0.5 F5/2 E5/1.5 D5/0.5 C5/2"     # um grau abaixo, sobre o V7
OUTRA = "A4/1 B4/1 C5/1 D5/1 E5/2 C5/2"                    # material novo
BAIXO4 = "C3/4 G2/4 G2/4 C3/4"


def test_apresentacao_da_sentenca():
    regra = ["apresentacao_repetida"]
    assert acusa(
        (duas("C maior", f"{IDEIA} {IDEIA}", BAIXO4), "I V7 V7 I", regra, None),
        (duas("C maior", f"{IDEIA} {NA_DOMINANTE}", BAIXO4), "I V7 V7 I", regra, None),
        (duas("C maior", f"{IDEIA} {OUTRA}", BAIXO4), "I V7 V7 I", regra, None),
        # ainda sem os c. 3–4: não acusa
        (duas("C maior", IDEIA, BAIXO4), "I V7 V7 I", regra, None),
    ) == [[], [], regra, []]


def test_ideia_repetida_aceita_transposicao():
    regra = ["ideia_repetida"]
    assert acusa(
        (duas("C maior", f"{IDEIA} {NA_DOMINANTE}", BAIXO4), "I V7 V7 I", regra, {"repete": [1, 3]}),
        (duas("C maior", f"{IDEIA} {OUTRA}", BAIXO4), "I V7 V7 I", regra, {"repete": [1, 3]}),
    ) == [[], regra]


def test_variedade_ritmica():
    regra = ["variedade_ritmica"]
    oito = "C3/4 " * 8
    assert acusa(
        # só semínimas em 8 compassos
        (duas("C maior", " ".join(["C5/1 D5/1 E5/1 D5/1"] * 8), oito), "I " * 7 + "I", regra, None),
        # semínimas, colcheias, mínimas e pontuadas
        (duas("C maior", " ".join([IDEIA, NA_DOMINANTE, "C5/1 D5/0.5 E5/0.5 F5/2", "E5/1.5 D5/0.5 C5/2"] * 2), oito), "I " * 7 + "I", regra, None),
    ) == [regra, []]


def test_cadencia_no_tempo_forte():
    regra = ["cadencia_tempo_forte"]
    assert acusa(
        # I final no 1º tempo do c. 2; depois no 2º tempo (fraco)
        (duas("C maior", "E5/2 D5/2 C5/4", "C3/2 G2/2 C3/4"), "I V I", regra, {"cadencia": 2}),
        (duas("C maior", "E5/2 D5/1 D5/2 C5/3", "C3/2 F3/1 G2/2 C3/3"), "I IV V I", regra, {"cadencia": 2}),
        # semicadência: V no 1º tempo do c. 2, ou com o 6/4 cadencial no 1º tempo e o V no 2º
        (duas("C maior", "E5/2 C5/2 D5/4", "C3/2 F3/2 G2/4"), "I IV V", regra, {"semicadencia": 2}),
        (duas("C maior", "E5/2 D5/2 E5/1 D5/3", "C3/2 F3/2 G2/1 G2/3"), "I ii6 I64 V", regra, {"semicadencia": 2}),
    ) == [[], regra, [], []]


def test_harmonia_sincopada():
    regra = ["harmonia_sincopada"]
    assert acusa(
        # V entra no 4º tempo e fica no 1º do compasso seguinte
        (duas("C maior", "E5/3 D5/2 C5/3", "C3/3 G2/2 C3/3"), "I V I", regra, None),
        # troca de inversão na barra (i → i6) não é síncope
        (duas("C maior", "E5/3 C5/1 E5/4", "C3/3 C3/1 E3/4"), "I IV I6", regra, None),
        # pedal: I – IV6/4 – I sobre a tônica
        (duas("C maior", "E5/2 F5/1 E5/1 E5/4", "C3/2 C3/1 C3/1 C3/4"), "I IV64 I I", regra, None),
        # acorde inicial em anacruse
        (duas("C maior", "G4/1 C5/3 D5/4", "C3/1 C3/3 G2/4"), "I I V", regra, None),
    ) == [regra, [], [], []]


def test_correcoes_da_revisao():
    assert acusa(
        # V+ → I na cadência: a sensível também tem de subir
        (duas("C maior", "B4/2 G4/2", "G2/2 C3/2"), "V+ I", SENSIVEL, None),
        # desvio: si4 → sol4 (nota do I) → dó5 não é resolução da sensível
        (duas("C maior", "B4/2 G4/1 C5/1", "G2/2 C3/2"), "V I", SENSIVEL, None),
        # ornamento fora do acorde antes do destino: si4 → ré5 (bordadura) → dó5 resolve
        (duas("C maior", "B4/2 D5/1 C5/1", "G2/2 C3/2"), "V I", SENSIVEL, None),
        # com plano, o último acorde escrito antes do compasso da cadência não é cadência (só aviso)
        (duas("C maior", "B4/2 G4/2", "G2/2 C3/2"), "V I", SENSIVEL, {"cadencia": 4}),
    ) == [["sensivel_sobe"], ["sensivel_sobe"], [], ["sensivel_frustrada"]]


def test_setima_licencas_novas_e_dobrada_na_entrada():
    assert acusa(
        # 7ª diminuta de nota comum: #ii°42 → I com o dó parado no baixo
        (duas("C maior", "D#5/2 E5/2", "C3/2 C3/2"), "#ii°42 I", SETIMA, None),
        # pivô: a função da nota depende da leitura, a regra não julga
        (duas("C maior", "F5/2 G5/2 G5/2", "G2/2 C3/2 C3/2"), "V7=G:IV7 I I", SETIMA, None),
        # sensível dobrada quando a voz de cima entra depois do ataque do V6
        (duas("C maior", "P/1 B4/1 C5/2", "B2/2 C3/2"), "V6 I", ["sensivel_dupla"], None),
    ) == [[], [], ["sensivel_dupla"]]
