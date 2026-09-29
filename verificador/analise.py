"""Ferramentas de análise usadas pelas regras: intervalos, momentos verticais e dissonâncias."""

from __future__ import annotations

from dataclasses import dataclass
from fractions import Fraction

from music21 import interval as m21interval

from .modelo import Exercicio, Nota

CONSONANCIAS = {"P1", "m3", "M3", "P5", "m6", "M6"}  # simpleName; P8 vira P1


def intervalo(a: Nota, b: Nota) -> m21interval.Interval:
    return m21interval.Interval(a.altura, b.altura)


def harmonico(superior: Nota, inferior: Nota) -> m21interval.Interval:
    """Intervalo da nota inferior para a superior (sem direção, mesmo se cruzadas)."""
    if superior.ps >= inferior.ps:
        return m21interval.Interval(inferior.altura, superior.altura)
    return m21interval.Interval(superior.altura, inferior.altura)


def eh_consonante(iv: m21interval.Interval, contra_o_baixo: bool = True) -> bool:
    nome = iv.simpleName
    if nome in CONSONANCIAS:
        return True
    # a quarta justa só é dissonante quando envolve o baixo
    return nome == "P4" and not contra_o_baixo


def classe_perfeita(iv: m21interval.Interval) -> str | None:
    """'5' para quintas justas, '8' para uníssonos/oitavas justas, None para o resto."""
    if iv.simpleName == "P5":
        return "5"
    if iv.simpleName == "P1":
        return "8"
    return None


def nome_intervalo(iv: m21interval.Interval) -> str:
    nomes = {1: "uníssono", 2: "2ª", 3: "3ª", 4: "4ª", 5: "5ª", 6: "6ª", 7: "7ª", 8: "8ª"}
    qualidades = {"P": "justa", "M": "maior", "m": "menor", "A": "aumentada", "d": "diminuta",
                  "AA": "dupl. aumentada", "dd": "dupl. diminuta"}
    g = iv.generic.undirected
    qual = iv.name.rstrip("0123456789")
    base = nomes.get(g, f"{g}ª")
    if g == 1:
        return {"P": "uníssono", "A": "uníssono aumentado"}.get(qual, f"uníssono {qual}")
    if g == 8 and qual == "P":
        return "8ª justa"
    return f"{base} {qualidades.get(qual, qual)}"


def eh_grau(a: Nota, b: Nota) -> bool:
    return intervalo(a, b).generic.undirected == 2


def eh_salto(a: Nota, b: Nota) -> bool:
    return intervalo(a, b).generic.undirected >= 3


def direcao(a: Nota, b: Nota) -> int:
    d = b.ps - a.ps
    return (d > 0) - (d < 0)


@dataclass
class Momento:
    t: Fraction
    sup: Nota | None
    inf: Nota | None

    @property
    def completo(self) -> bool:
        return self.sup is not None and self.inf is not None

    def ataca_sup(self) -> bool:
        return self.sup is not None and self.sup.inicio == self.t

    def ataca_inf(self) -> bool:
        return self.inf is not None and self.inf.inicio == self.t


def momentos(ex: Exercicio, i: int, j: int) -> list[Momento]:
    """Todos os instantes em que a voz i ou a voz j ataca uma nota."""
    vi, vj = ex.vozes[i], ex.vozes[j]
    tempos = sorted({n.inicio for n in vi.notas} | {n.inicio for n in vj.notas})
    return [Momento(t, vi.soando_em(t), vj.soando_em(t)) for t in tempos]


def sucessoes(ex: Exercicio, i: int, j: int) -> list[tuple[Momento, Momento]]:
    """Pares de momentos consecutivos em que as duas vozes soam."""
    ms = momentos(ex, i, j)
    return [(a, b) for a, b in zip(ms, ms[1:]) if a.completo and b.completo]


@dataclass
class Dissonancia:
    t: Fraction
    voz: int  # voz que contém a nota dissonante
    nota: Nota
    contra: int  # voz com a qual ela dissona
    intervalo: m21interval.Interval
    tipo: str  # "ataque" (a nota dissonante é atacada) ou "retardo" (preparada e sustentada)


def dissonancias(ex: Exercicio) -> list[Dissonancia]:
    """Dissonâncias de cada voz superior contra o baixo, com a nota responsável por cada uma."""
    b = ex.baixo
    achadas: dict[tuple[int, int], Dissonancia] = {}
    for u in range(b):
        for m in momentos(ex, u, b):
            if not m.completo:
                continue
            iv = harmonico(m.sup, m.inf)
            if eh_consonante(iv, contra_o_baixo=True):
                continue
            a_sup, a_inf = m.ataca_sup(), m.ataca_inf()
            if a_sup and a_inf:
                d = Dissonancia(m.t, u, m.sup, b, iv, "ataque")
            else:
                atacante, sustentada = (u, b) if a_sup else (b, u)
                n_sust = m.inf if a_sup else m.sup
                n_atac = m.sup if a_sup else m.inf
                if (ex.forca_metrica(m.t) > ex.forca_metrica(n_sust.inicio)
                        and _preparada(ex, sustentada, atacante, n_sust)):
                    d = Dissonancia(m.t, sustentada, n_sust, atacante, iv, "retardo")
                else:
                    d = Dissonancia(m.t, atacante, n_atac, sustentada, iv, "ataque")
            chave = (d.voz, id(d.nota))
            achadas.setdefault(chave, d)
    return sorted(achadas.values(), key=lambda d: (d.t, d.voz))


def _preparada(ex: Exercicio, voz: int, outra: int, nota: Nota) -> bool:
    """A nota era consonante com a outra voz no momento em que foi atacada?"""
    par = ex.vozes[outra].soando_em(nota.inicio)
    if par is None:
        return True
    return eh_consonante(harmonico(nota, par), contra_o_baixo=True)


def pares_de_vozes(ex: Exercicio, so_externas: bool) -> list[tuple[int, int]]:
    n = len(ex.vozes)
    if n < 2:
        return []
    if so_externas:
        return [(0, n - 1)]
    return [(i, j) for i in range(n) for j in range(i + 1, n)]


def par_externo(ex: Exercicio) -> tuple[int, int] | None:
    return (0, len(ex.vozes) - 1) if len(ex.vozes) >= 2 else None


def sensivel(ex: Exercicio) -> str | None:
    if ex.tonalidade is None:
        return None
    return ex.tonalidade.tonic.transpose("-m2").name


def tonica(ex: Exercicio) -> str | None:
    return ex.tonalidade.tonic.name if ex.tonalidade is not None else None
