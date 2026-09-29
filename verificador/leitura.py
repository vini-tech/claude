"""Leitura de exercícios: formato de texto próprio (.txt) ou partituras via music21."""

from __future__ import annotations

import re
from fractions import Fraction
from pathlib import Path

from music21 import converter, key as m21key, meter
from music21 import pitch as m21pitch
from music21 import stream

from .modelo import Exercicio, Nota, Voz

CABECALHOS = {"titulo", "compasso", "tom", "cf"}

MODOS = {
    "maior": "major",
    "menor": "minor",
    "jonio": "ionian",
    "dorico": "dorian",
    "frigio": "phrygian",
    "lidio": "lydian",
    "mixolidio": "mixolydian",
    "eolio": "aeolian",
}

_ALTURA = re.compile(r"^([A-Ga-g])(##|#|bb|b|--|-)?(-?\d)$")


class ErroDeLeitura(Exception):
    pass


def ler(caminho: str | Path, externas: bool = False) -> Exercicio:
    caminho = Path(caminho)
    if caminho.suffix.lower() == ".txt":
        return ler_texto(caminho.read_text(encoding="utf-8"))
    return ler_partitura(caminho, externas=externas)


def interpretar_tom(texto: str) -> m21key.Key:
    partes = texto.strip().split()
    tonica = partes[0]
    modo = partes[1].lower() if len(partes) > 1 else ("minor" if tonica.islower() else "major")
    modo = MODOS.get(_sem_acento(modo), modo)
    tonica = tonica[0].upper() + tonica[1:].replace("b", "-")
    return m21key.Key(tonica, modo)


def _sem_acento(s: str) -> str:
    return s.translate(str.maketrans("áâãéêíóôõúç", "aaaeeiooouc"))


def _altura(token: str) -> m21pitch.Pitch:
    m = _ALTURA.match(token)
    if not m:
        raise ErroDeLeitura(
            f"altura inválida: {token!r} (use, por exemplo, C4, F#3, Bb4 ou E-5)"
        )
    letra, acidente, oitava = m.groups()
    acidente = (acidente or "").replace("b", "-")
    return m21pitch.Pitch(f"{letra.upper()}{acidente}{oitava}")


def ler_texto(texto: str) -> Exercicio:
    """Formato de texto, uma voz por linha, da mais aguda para a mais grave:

        titulo: Exercício 1
        compasso: 4/4
        tom: D dorico
        cf: baixo
        soprano: D5/4 C5 ...
        baixo:   D4/4 F4 ...

    Cada nota é ALTURA/DURAÇÃO, com a duração em semínimas (4 = semibreve).
    Sem duração, a nota repete a duração anterior. `~` no fim liga a nota à
    seguinte e `P/2` é uma pausa.
    """
    cabecalho: dict[str, str] = {}
    tokens_por_voz: dict[str, list[str]] = {}
    for num_linha, linha in enumerate(texto.splitlines(), 1):
        # "#" começa um comentário quando vem no início ou depois de espaço (F#4 não é comentário)
        linha = re.sub(r"(^|\s)#.*$", "", linha).strip()
        if not linha:
            continue
        if ":" not in linha:
            raise ErroDeLeitura(f"linha {num_linha}: esperava 'nome: conteúdo'")
        chave, valor = (p.strip() for p in linha.split(":", 1))
        chave_norm = _sem_acento(chave.lower())
        if chave_norm in CABECALHOS:
            cabecalho[chave_norm] = valor
        else:
            tokens_por_voz.setdefault(chave, []).extend(valor.split())

    if not tokens_por_voz:
        raise ErroDeLeitura("nenhuma voz encontrada")

    vozes = [_voz_de_tokens(nome, toks) for nome, toks in tokens_por_voz.items()]

    formula = (4, 4)
    if "compasso" in cabecalho:
        num, den = cabecalho["compasso"].split("/")
        formula = (int(num), int(den))

    tonalidade = interpretar_tom(cabecalho["tom"]) if "tom" in cabecalho else None
    cf = _indice_da_voz(vozes, cabecalho["cf"]) if "cf" in cabecalho else None

    return Exercicio(
        vozes=vozes,
        formula_compasso=formula,
        tonalidade=tonalidade,
        cantus_firmus=cf,
        titulo=cabecalho.get("titulo", ""),
    )


def _indice_da_voz(vozes: list[Voz], ref: str) -> int:
    ref = ref.strip()
    for i, v in enumerate(vozes):
        if v.nome.lower() == ref.lower():
            return i
    if ref.isdigit() and 1 <= int(ref) <= len(vozes):
        return int(ref) - 1
    raise ErroDeLeitura(f"cf: não existe voz chamada {ref!r}")


def _voz_de_tokens(nome: str, tokens: list[str]) -> Voz:
    voz = Voz(nome)
    t = Fraction(0)
    dur = Fraction(4)
    ligar = False
    for tok in tokens:
        liga_proxima = tok.endswith("~")
        tok = tok.rstrip("~")
        if "/" in tok:
            alt, d = tok.split("/", 1)
            try:
                dur = Fraction(d)
            except ValueError:
                raise ErroDeLeitura(f"{nome}: duração inválida em {tok!r}") from None
        else:
            alt = tok
        if alt.upper() in ("P", "R"):
            ligar = False
            t += dur
            continue
        altura = _altura(alt)
        if ligar and voz.notas and voz.notas[-1].altura.ps == altura.ps:
            voz.notas[-1].duracao += dur
        else:
            voz.notas.append(Nota(altura, t, dur))
        t += dur
        ligar = liga_proxima
    return voz


def ler_partitura(caminho: Path, externas: bool = False) -> Exercicio:
    """Lê MusicXML, MIDI, ABC etc. Cada parte (ou voz dentro da parte) vira uma voz.

    Com `externas=True`, ou quando há acordes, a textura é reduzida às vozes
    externas: a nota mais aguda e a mais grave de cada momento.
    """
    partitura = converter.parse(str(caminho))
    if not isinstance(partitura, stream.Score):
        partitura = stream.Score([partitura])

    formula = (4, 4)
    ts = next(iter(partitura.recurse().getElementsByClass(meter.TimeSignature)), None)
    if ts is not None:
        formula = (ts.numerator, ts.denominator)

    tonalidade = None
    ks = next(iter(partitura.recurse().getElementsByClass(m21key.KeySignature)), None)
    if isinstance(ks, m21key.Key):
        tonalidade = ks
    elif ks is not None:
        tonalidade = partitura.analyze("key")

    tem_acordes = any(True for _ in partitura.recurse().getElementsByClass("Chord"))
    if externas or tem_acordes:
        vozes = _vozes_externas(partitura)
    else:
        vozes = _vozes_por_parte(partitura)

    vozes = [v for v in vozes if v.notas]
    vozes.sort(key=lambda v: -sum(n.ps for n in v.notas) / len(v.notas))
    return Exercicio(
        vozes=vozes,
        formula_compasso=formula,
        tonalidade=tonalidade,
        titulo=caminho.stem,
    )


def _vozes_por_parte(partitura: stream.Score) -> list[Voz]:
    try:
        partitura = partitura.voicesToParts()
    except Exception:
        pass
    vozes = []
    for i, parte in enumerate(partitura.parts):
        nome = parte.partName or f"voz {i + 1}"
        voz = Voz(nome)
        for n in parte.flatten().stripTies().notes:
            voz.notas.append(
                Nota(n.pitch, Fraction(n.offset).limit_denominator(64),
                     Fraction(n.quarterLength).limit_denominator(64))
            )
        vozes.append(voz)
    return vozes


def _vozes_externas(partitura: stream.Score) -> list[Voz]:
    acordes = partitura.chordify().flatten().stripTies()
    superior, inferior = Voz("superior"), Voz("baixo")
    for c in acordes.getElementsByClass("Chord"):
        inicio = Fraction(c.offset).limit_denominator(64)
        dur = Fraction(c.quarterLength).limit_denominator(64)
        alturas = sorted(c.pitches, key=lambda p: p.ps)
        for voz, p in ((superior, alturas[-1]), (inferior, alturas[0])):
            if voz.notas and voz.notas[-1].fim == inicio and voz.notas[-1].ps == p.ps:
                voz.notas[-1].duracao += dur  # mesma nota sustentada
            else:
                voz.notas.append(Nota(p, inicio, dur))
    return [superior, inferior]
