"""Verificador de exercícios de composição com regras que afrouxam a cada nível."""

from .leitura import ler, ler_texto
from .niveis import NIVEIS, TABELA, nivel, severidade
from .regras import REGRAS, Achado, Contexto

__all__ = ["ler", "ler_texto", "verificar", "Resultado", "NIVEIS", "TABELA", "REGRAS",
           "nivel", "severidade", "Achado"]

from dataclasses import dataclass

from .modelo import Exercicio
from . import regras as _regras
from .niveis import regras_ativas


@dataclass
class Resultado:
    nivel: int
    achados: list[tuple[str, Achado]]  # (severidade, achado)
    nao_verificadas: list[str]  # regras que precisavam da tonalidade

    def contar(self, sev: str) -> int:
        return sum(1 for s, _ in self.achados if s == sev)

    @property
    def aprovado(self) -> bool:
        return self.contar("erro") == 0


ORDEM = {"erro": 0, "aviso": 1, "info": 2}


def verificar(ex: Exercicio, numero_nivel: int) -> Resultado:
    niv = nivel(numero_nivel)
    ctx = Contexto(nivel=niv.numero, so_externas=niv.so_externas)
    ids = regras_ativas(niv.numero)
    achados = [(severidade(a.regra, niv.numero), a) for a in _regras.verificar(ex, ctx, ids)]
    achados.sort(key=lambda p: (p[1].compasso, ORDEM[p[0]]))
    faltou_tom = [r for r in ids if REGRAS[r].precisa_tom and ex.tonalidade is None]
    return Resultado(niv.numero, achados, faltou_tom)
