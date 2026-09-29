"""Uso: python -m verificador EXERCICIO --nivel N"""

from __future__ import annotations

import argparse
import sys

from . import NIVEIS, REGRAS, TABELA, ler, verificar
from .leitura import ErroDeLeitura, interpretar_tom

CORES = {"erro": "\033[31m", "aviso": "\033[33m", "info": "\033[36m"}
ROTULOS = {"erro": "ERRO ", "aviso": "AVISO", "info": "INFO "}


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(
        prog="verificador",
        description="Corrige exercícios de contraponto e harmonia. As regras afrouxam a cada nível.",
    )
    p.add_argument("arquivo", nargs="?", help="exercício (.txt, .musicxml, .mxl, .mid, .abc)")
    p.add_argument("-n", "--nivel", type=int, default=1, help="nível do currículo (1 a 10)")
    p.add_argument("--tom", help="tonalidade, ex.: 'C maior', 'a menor', 'D dorico'")
    p.add_argument("--cf", help="nome (ou número, de cima para baixo) da voz do cantus firmus")
    p.add_argument("--externas", action="store_true",
                   help="reduz a partitura às vozes externas (útil para texturas de piano)")
    p.add_argument("--tabela", action="store_true", help="mostra quanto cada regra vale em cada nível")
    p.add_argument("--regras", action="store_true", help="explica as regras do nível escolhido")
    p.add_argument("--sem-cor", action="store_true")
    args = p.parse_args(argv)
    cor = sys.stdout.isatty() and not args.sem_cor

    if args.tabela:
        imprimir_tabela()
        return 0
    if args.regras:
        imprimir_regras(args.nivel)
        return 0
    if not args.arquivo:
        p.error("informe o arquivo do exercício (ou use --tabela / --regras)")

    try:
        ex = ler(args.arquivo, externas=args.externas or args.nivel >= 8)
        if args.tom:
            ex.tonalidade = interpretar_tom(args.tom)
        if args.cf:
            from .leitura import _indice_da_voz
            ex.cantus_firmus = _indice_da_voz(ex.vozes, args.cf)
        resultado = verificar(ex, args.nivel)
    except (ErroDeLeitura, ValueError, OSError) as e:
        print(f"erro: {e}", file=sys.stderr)
        return 2

    nivel = NIVEIS[args.nivel - 1]
    titulo = ex.titulo or args.arquivo
    print(f"{titulo} — nível {nivel.numero}: {nivel.nome}")
    print(f"vozes: {', '.join(v.nome for v in ex.vozes)}"
          + (f" · tom: {ex.tonalidade}" if ex.tonalidade else ""))
    print()
    for sev, a in resultado.achados:
        rotulo = ROTULOS[sev]
        if cor:
            rotulo = f"{CORES[sev]}{rotulo}\033[0m"
        print(f"  c.{a.compasso:<3} {rotulo} {a.mensagem}  [{a.regra}]")
    if resultado.achados:
        print()
    if resultado.nao_verificadas:
        print("sem tonalidade (use 'tom:' ou --tom); não verifiquei: "
              + ", ".join(resultado.nao_verificadas))
    e, w, i = (resultado.contar(s) for s in ("erro", "aviso", "info"))
    veredito = "aprovado" if resultado.aprovado else "reprovado"
    print(f"{e} erro(s), {w} aviso(s), {i} info — {veredito}")
    return 0 if resultado.aprovado else 1


def imprimir_tabela() -> None:
    largura = max(len(r) for r in TABELA)
    print(" " * largura + "  " + " ".join(f"{n.numero:>2}" for n in NIVEIS))
    for r, linha in TABELA.items():
        print(f"{r:<{largura}}  " + " ".join(f"{c:>2}" for c in linha.split()))
    print("\nE = erro · A = aviso · I = info (quebra consciente) · - = desligada")


def imprimir_regras(numero: int) -> None:
    from .niveis import nivel, regras_ativas, severidade
    niv = nivel(numero)
    print(f"Nível {niv.numero}: {niv.nome}\n")
    for r in regras_ativas(numero):
        regra = REGRAS[r]
        print(f"[{severidade(r, numero)}] {regra.titulo} ({r})")
        print(f"    {regra.explicacao}\n")


if __name__ == "__main__":
    sys.exit(main())
