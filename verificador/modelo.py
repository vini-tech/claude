"""Representação interna de um exercício: vozes, notas e métrica."""

from __future__ import annotations

from dataclasses import dataclass, field
from fractions import Fraction

from music21 import key as m21key
from music21 import pitch as m21pitch


@dataclass(eq=False)
class Nota:
    altura: m21pitch.Pitch
    inicio: Fraction  # em semínimas, a partir do começo do exercício
    duracao: Fraction

    @property
    def fim(self) -> Fraction:
        return self.inicio + self.duracao

    @property
    def ps(self) -> float:
        return self.altura.ps

    @property
    def nome(self) -> str:
        return self.altura.nameWithOctave

    def __repr__(self) -> str:
        return f"Nota({self.nome}, {self.inicio}, {self.duracao})"


@dataclass
class Voz:
    nome: str
    notas: list[Nota] = field(default_factory=list)  # pausas não entram na lista

    def soando_em(self, t: Fraction) -> Nota | None:
        for n in self.notas:
            if n.inicio <= t < n.fim:
                return n
        return None

    def anterior(self, nota: Nota) -> Nota | None:
        """Nota imediatamente anterior, se não houver pausa entre elas."""
        i = self.notas.index(nota)
        if i > 0 and self.notas[i - 1].fim == nota.inicio:
            return self.notas[i - 1]
        return None

    def seguinte(self, nota: Nota) -> Nota | None:
        """Nota imediatamente seguinte, se não houver pausa entre elas."""
        i = self.notas.index(nota)
        if i + 1 < len(self.notas) and self.notas[i + 1].inicio == nota.fim:
            return self.notas[i + 1]
        return None

    def pares_melodicos(self) -> list[tuple[Nota, Nota]]:
        return [
            (a, b) for a, b in zip(self.notas, self.notas[1:]) if a.fim == b.inicio
        ]


@dataclass
class Exercicio:
    vozes: list[Voz]  # da mais aguda para a mais grave
    formula_compasso: tuple[int, int] = (4, 4)
    tonalidade: m21key.Key | None = None
    cantus_firmus: int | None = None  # índice da voz que é o cantus firmus
    titulo: str = ""

    @property
    def duracao_compasso(self) -> Fraction:
        num, den = self.formula_compasso
        return Fraction(4 * num, den)

    @property
    def baixo(self) -> int:
        return len(self.vozes) - 1

    @property
    def fim(self) -> Fraction:
        return max((v.notas[-1].fim for v in self.vozes if v.notas), default=Fraction(0))

    def compasso_de(self, t: Fraction) -> int:
        return int(t // self.duracao_compasso) + 1

    def forca_metrica(self, t: Fraction) -> int:
        """3 = tempo forte do compasso, 2 = meio do compasso, 1 = outro tempo, 0 = subdivisão."""
        num, den = self.formula_compasso
        pos = t % self.duracao_compasso
        if pos == 0:
            return 3
        # compassos compostos (6/8, 12/8) contam em grupos de três colcheias
        tempo = Fraction(4, den) * (3 if den == 8 and num % 3 == 0 and num > 3 else 1)
        batidas = self.duracao_compasso / tempo
        if pos % tempo == 0:
            if batidas % 2 == 0 and pos == self.duracao_compasso / 2:
                return 2
            return 1
        return 0

    def eh_tempo_forte(self, t: Fraction) -> bool:
        return t % self.duracao_compasso == 0
