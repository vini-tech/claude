"""A curva de rigidez: o que cada regra vale em cada nível.

E = erro      o exercício não passa
A = aviso     evite, mas pode acontecer
I = info      a regra é quebrada; o verificador só mostra, para você saber que quebrou
- = desligada
"""

from __future__ import annotations

from dataclasses import dataclass

SEVERIDADES = {"E": "erro", "A": "aviso", "I": "info"}


@dataclass(frozen=True)
class Nivel:
    numero: int
    nome: str
    so_externas: bool = False


NIVEIS = [
    Nivel(1, "Contraponto a 2 vozes, 1ª espécie (nota contra nota)"),
    Nivel(2, "Contraponto a 2 vozes, 2ª espécie (duas contra uma)"),
    Nivel(3, "Contraponto a 2 vozes, 3ª espécie (quatro contra uma)"),
    Nivel(4, "Contraponto a 2 vozes, 4ª espécie (síncopes e retardos)"),
    Nivel(5, "Contraponto a 2 e 3 vozes, 5ª espécie (florido)"),
    Nivel(6, "Harmonia a 4 vozes, diatônica (coral)"),
    Nivel(7, "Harmonia cromática e modulação"),
    Nivel(8, "Estilo clássico ao piano: frase, forma e textura", so_externas=True),
    Nivel(9, "Linguagem romântica", so_externas=True),
    Nivel(10, "Escrita livre: as regras viram lentes", so_externas=True),
]

#                                          nível: 1    2    3    4    5    6    7    8    9    10
TABELA = {
    "ritmo_da_especie":                      "E    E    E    E    -    -    -    -    -    -",
    "dissonancia_proibida":                  "E    -    -    -    -    -    -    -    -    -",
    "dissonancia_tempo_forte":               "-    E    E    E    E    -    -    -    -    -",
    "retardo_nao_permitido":                 "-    E    E    -    -    -    -    -    -    -",
    "bordadura_na_2a_especie":               "-    E    -    -    -    -    -    -    -    -",
    "dissonancia_aproximacao":               "-    E    E    E    E    E    A    A    I    I",
    "dissonancia_resolucao":                 "-    E    E    E    E    E    E    A    A    I",
    "retardo_resolve_descendo":              "-    -    -    E    E    E    E    A    I    I",
    "quintas_paralelas":                     "E    E    E    E    E    E    E    E    A    I",
    "oitavas_paralelas":                     "E    E    E    E    E    E    E    E    A    I",
    "quintas_oitavas_ocultas":               "E    E    E    E    E    E    E    A    I    -",
    "quintas_tempo_forte":                   "-    A    A    -    -    -    -    -    -    -",
    "paralelas_imperfeitas_excessivas":      "A    A    A    A    A    -    -    -    -    -",
    "unissono_interno":                      "E    A    A    A    A    -    -    -    -    -",
    "cruzamento_de_vozes":                   "E    E    E    E    E    E    E    A    I    -",
    "sobreposicao_de_vozes":                 "A    A    A    A    A    E    E    A    -    -",
    "espacamento":                           "A    A    A    A    A    E    E    A    -    -",
    "extensao_da_voz":                       "-    -    -    -    -    E    E    -    -    -",
    "salto_maior_que_oitava":                "E    E    E    E    E    E    E    A    I    I",
    "intervalo_melodico_aumentado_diminuto": "E    E    E    E    E    E    A    A    I    -",
    "salto_de_sexta_ou_setima":              "E    E    E    E    E    A    A    -    -    -",
    "salto_nao_compensado":                  "E    E    E    E    E    A    A    I    -    -",
    "saltos_consecutivos":                   "E    E    E    E    E    A    A    I    -    -",
    "nota_repetida":                         "A    E    E    A    A    -    -    -    -    -",
    "ponto_culminante":                      "A    A    A    A    A    -    -    -    -    -",
    "ambito_melodico":                       "A    A    A    A    A    -    -    -    -    -",
    "inicio_perfeito":                       "E    E    E    E    E    -    -    -    -    -",
    "final_perfeito":                        "E    E    E    E    E    -    -    -    -    -",
    "cadencia_contraponto":                  "E    E    E    E    E    -    -    -    -    -",
    "sensivel_resolve":                      "-    -    -    -    -    E    E    A    I    -",
    "sensivel_dobrada":                      "-    -    -    -    -    E    E    A    I    -",
    "cadencia_autentica":                    "-    -    -    -    -    A    A    A    I    -",
}


def nivel(numero: int) -> Nivel:
    for n in NIVEIS:
        if n.numero == numero:
            return n
    raise ValueError(f"nível {numero} não existe (use 1 a {len(NIVEIS)})")


def severidade(regra: str, numero: int) -> str | None:
    """'erro', 'aviso', 'info' ou None (desligada)."""
    codigo = TABELA[regra].split()[numero - 1]
    return SEVERIDADES.get(codigo)


def regras_ativas(numero: int) -> list[str]:
    return [r for r in TABELA if severidade(r, numero) is not None]
