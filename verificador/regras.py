"""As regras. Cada regra só detecta; quanto ela pesa em cada nível fica em niveis.py."""

from __future__ import annotations

from collections.abc import Callable, Iterator
from dataclasses import dataclass

from . import analise as a
from .modelo import Exercicio, Nota


@dataclass
class Contexto:
    nivel: int
    so_externas: bool  # nas texturas de piano (níveis 8+) só as vozes externas são comparadas


@dataclass
class Achado:
    regra: str
    compasso: int
    mensagem: str


@dataclass
class Regra:
    id: str
    titulo: str
    explicacao: str
    verificar: Callable[[Exercicio, Contexto], Iterator[tuple[int, str]]]
    precisa_tom: bool = False


REGRAS: dict[str, Regra] = {}


def regra(id: str, titulo: str, explicacao: str, precisa_tom: bool = False):
    def registrar(f):
        REGRAS[id] = Regra(id, titulo, explicacao, f, precisa_tom)
        return f
    return registrar


def _v(ex: Exercicio, i: int) -> str:
    return ex.vozes[i].nome


def _par(ex: Exercicio, i: int, j: int) -> str:
    return f"{_v(ex, i)}/{_v(ex, j)}"


def _c(ex: Exercicio, n: Nota | a.Momento) -> int:
    return ex.compasso_de(n.t if isinstance(n, a.Momento) else n.inicio)


def _vozes_do_contraponto(ex: Exercicio) -> list[int]:
    return [i for i in range(len(ex.vozes)) if i != ex.cantus_firmus]


# ---------------------------------------------------------------- ritmo

@regra("ritmo_da_especie", "Ritmo da espécie",
       "Na 1ª espécie, nota contra nota; na 2ª, duas notas por nota do cantus firmus; "
       "na 3ª, quatro; na 4ª, síncopes (notas ligadas por cima da barra).")
def ritmo_da_especie(ex, ctx):
    especie = {1: 1, 2: 2, 3: 4, 4: "sincope"}.get(ctx.nivel)
    if especie is None:
        return
    cf = ex.cantus_firmus
    compasso = ex.duracao_compasso
    if cf is None:
        for i, v in enumerate(ex.vozes):
            if v.notas and all(n.duracao == compasso and n.inicio % compasso == 0 for n in v.notas):
                cf = i
                break
    if cf is None:
        yield 1, "não encontrei o cantus firmus (uma nota por compasso); indique-o com 'cf: <voz>'"
        return
    for n in ex.vozes[cf].notas:
        if n.duracao != compasso or n.inicio % compasso != 0:
            yield _c(ex, n), f"cantus firmus ({_v(ex, cf)}) deve ter uma nota por compasso ({n.nome})"
    ultimo = ex.compasso_de(ex.fim - 1)
    for i in range(len(ex.vozes)):
        if i == cf:
            continue
        notas = ex.vozes[i].notas
        for k, n in enumerate(notas):
            c = _c(ex, n)
            pos = n.inicio % compasso
            final = k == len(notas) - 1
            if final:
                if pos != 0 or c != ultimo:
                    yield c, f"{_v(ex, i)}: a nota final deve cair no tempo forte do último compasso"
                continue
            if especie == "sincope":
                penultima = k == len(notas) - 2
                ok = pos == compasso / 2 and (n.duracao == compasso or
                                              (penultima and n.duracao == compasso / 2))
                if not ok:
                    yield c, (f"{_v(ex, i)}: na 4ª espécie cada nota começa no meio do compasso "
                              f"e se liga ao seguinte ({n.nome})")
                continue
            dur = compasso / especie
            primeira_com_pausa = k == 0 and especie > 1 and pos == dur
            if n.duracao != dur or (pos % dur != 0) or (pos != 0 and k == 0 and not primeira_com_pausa):
                yield c, (f"{_v(ex, i)}: esperava {especie} nota(s) por compasso, "
                          f"mas {n.nome} dura {n.duracao} semínima(s)")


# ---------------------------------------------------------------- dissonâncias

@regra("dissonancia_proibida", "Só consonâncias",
       "Na 1ª espécie todo intervalo contra o baixo deve ser consonante: "
       "uníssono, 3ª, 5ª, 6ª ou 8ª (a 4ª justa conta como dissonância).")
def dissonancia_proibida(ex, ctx):
    for d in a.dissonancias(ex):
        yield ex.compasso_de(d.t), (f"{_par(ex, d.voz, d.contra)}: {a.nome_intervalo(d.intervalo)} "
                                    f"({d.nota.nome}) é dissonância")


@regra("dissonancia_tempo_forte", "Tempo forte consonante",
       "O tempo forte de cada compasso deve ser consonante. A única dissonância aceita "
       "no tempo forte é o retardo (nota preparada e sustentada).")
def dissonancia_tempo_forte(ex, ctx):
    for d in a.dissonancias(ex):
        if d.tipo == "ataque" and ex.eh_tempo_forte(d.t):
            yield ex.compasso_de(d.t), (f"{_v(ex, d.voz)}: {d.nota.nome} forma "
                                        f"{a.nome_intervalo(d.intervalo)} no tempo forte")


@regra("retardo_nao_permitido", "Sem retardos nesta espécie",
       "Na 2ª e na 3ª espécie o contraponto não sustenta notas por cima do tempo forte, "
       "então não há retardos.")
def retardo_nao_permitido(ex, ctx):
    for d in a.dissonancias(ex):
        if d.tipo == "retardo":
            yield ex.compasso_de(d.t), f"{_v(ex, d.voz)}: retardo em {d.nota.nome}"


@regra("dissonancia_aproximacao", "Dissonância chega por grau",
       "Uma nota dissonante deve chegar por grau conjunto (ou ser preparada pela mesma nota). "
       "Chegar a ela por salto é uma apojatura, que só entra no estilo livre.")
def dissonancia_aproximacao(ex, ctx):
    for d in a.dissonancias(ex):
        if d.tipo != "ataque":
            continue
        ant = ex.vozes[d.voz].anterior(d.nota)
        if ant is None or not (a.eh_grau(ant, d.nota) or ant.ps == d.nota.ps):
            como = "sem nota anterior" if ant is None else f"por salto de {ant.nome}"
            yield ex.compasso_de(d.t), (f"{_v(ex, d.voz)}: dissonância {d.nota.nome} "
                                        f"({a.nome_intervalo(d.intervalo)}) atingida {como}")


def _cambiata(ex: Exercicio, voz: int, nota: Nota) -> bool:
    v = ex.vozes[voz]
    ant, prox = v.anterior(nota), v.seguinte(nota)
    if ant is None or prox is None:
        return False
    depois = v.seguinte(prox)
    iv = a.intervalo(nota, prox)
    return (a.direcao(ant, nota) < 0 and a.eh_grau(ant, nota)
            and iv.generic.directed == -3
            and depois is not None and a.eh_grau(prox, depois) and a.direcao(prox, depois) > 0)


@regra("dissonancia_resolucao", "Dissonância sai por grau",
       "Uma nota dissonante deve seguir por grau conjunto. A partir da 3ª espécie "
       "a nota cambiata (desce por grau, salta uma 3ª para baixo e sobe por grau) é aceita.")
def dissonancia_resolucao(ex, ctx):
    for d in a.dissonancias(ex):
        if d.tipo != "ataque":
            continue
        prox = ex.vozes[d.voz].seguinte(d.nota)
        if prox is not None and a.eh_grau(d.nota, prox):
            continue
        if ctx.nivel >= 3 and _cambiata(ex, d.voz, d.nota):
            continue
        como = "e a música termina" if prox is None else f"mas salta para {prox.nome}"
        yield ex.compasso_de(d.t), (f"{_v(ex, d.voz)}: dissonância {d.nota.nome} precisa resolver "
                                    f"por grau, {como}")


@regra("bordadura_na_2a_especie", "Só notas de passagem na 2ª espécie",
       "No contraponto estrito de 2ª espécie a dissonância é sempre nota de passagem: "
       "continua na mesma direção em que chegou. A bordadura fica para a 3ª espécie.")
def bordadura_na_2a_especie(ex, ctx):
    for d in a.dissonancias(ex):
        if d.tipo != "ataque":
            continue
        v = ex.vozes[d.voz]
        ant, prox = v.anterior(d.nota), v.seguinte(d.nota)
        if (ant and prox and a.eh_grau(ant, d.nota) and a.eh_grau(d.nota, prox)
                and a.direcao(ant, d.nota) != a.direcao(d.nota, prox)):
            yield ex.compasso_de(d.t), f"{_v(ex, d.voz)}: {d.nota.nome} é bordadura dissonante"


@regra("retardo_resolve_descendo", "Retardo resolve descendo",
       "A nota sustentada que vira dissonância no tempo forte (retardo) deve resolver "
       "descendo por grau conjunto.")
def retardo_resolve_descendo(ex, ctx):
    for d in a.dissonancias(ex):
        if d.tipo != "retardo":
            continue
        prox = ex.vozes[d.voz].seguinte(d.nota)
        if prox is None or not (a.eh_grau(d.nota, prox) and a.direcao(d.nota, prox) < 0):
            destino = "nada" if prox is None else prox.nome
            yield ex.compasso_de(d.t), (f"{_v(ex, d.voz)}: retardo {d.nota.nome} "
                                        f"({a.nome_intervalo(d.intervalo)}) resolve em {destino}, "
                                        f"e não um grau abaixo")


# ---------------------------------------------------------------- movimento entre vozes

def _paralelas(ex, ctx, classe: str):
    for i, j in a.pares_de_vozes(ex, ctx.so_externas):
        for m1, m2 in a.sucessoes(ex, i, j):
            if m1.sup.ps == m2.sup.ps or m1.inf.ps == m2.inf.ps:
                continue  # uma das vozes não se moveu
            iv1, iv2 = a.harmonico(m1.sup, m1.inf), a.harmonico(m2.sup, m2.inf)
            if a.classe_perfeita(iv1) == classe == a.classe_perfeita(iv2):
                contrario = a.direcao(m1.sup, m2.sup) != a.direcao(m1.inf, m2.inf)
                tipo = " por movimento contrário" if contrario else ""
                yield _c(ex, m2), (f"{_par(ex, i, j)}: {m1.sup.nome}-{m1.inf.nome} → "
                                   f"{m2.sup.nome}-{m2.inf.nome}{tipo}")


@regra("quintas_paralelas", "Quintas paralelas",
       "Duas vozes não podem ir de uma 5ª justa para outra 5ª justa (nem por movimento contrário).")
def quintas_paralelas(ex, ctx):
    for c, msg in _paralelas(ex, ctx, "5"):
        yield c, "quintas paralelas, " + msg


@regra("oitavas_paralelas", "Oitavas e uníssonos paralelos",
       "Duas vozes não podem ir de uma 8ª (ou uníssono) para outra 8ª (ou uníssono).")
def oitavas_paralelas(ex, ctx):
    for c, msg in _paralelas(ex, ctx, "8"):
        yield c, "oitavas paralelas, " + msg


@regra("quintas_oitavas_ocultas", "Quintas e oitavas diretas (ocultas)",
       "Não se chega a uma 5ª ou 8ª justa por movimento direto. No contraponto a duas vozes "
       "(níveis 1–5) vale sempre; a partir da harmonia, só entre as vozes externas e quando "
       "a voz superior chega por salto.")
def quintas_oitavas_ocultas(ex, ctx):
    par = a.par_externo(ex)
    if par is None:
        return
    i, j = par
    estrito = ctx.nivel <= 5
    for m1, m2 in a.sucessoes(ex, i, j):
        if m1.sup.ps == m2.sup.ps or m1.inf.ps == m2.inf.ps:
            continue
        if a.direcao(m1.sup, m2.sup) != a.direcao(m1.inf, m2.inf):
            continue
        iv1, iv2 = a.harmonico(m1.sup, m1.inf), a.harmonico(m2.sup, m2.inf)
        chegada = a.classe_perfeita(iv2)
        if chegada is None or a.classe_perfeita(iv1) == chegada:
            continue  # sem perfeita na chegada, ou já é paralela
        if not estrito and not a.eh_salto(m1.sup, m2.sup):
            continue
        nome = "quinta" if chegada == "5" else "oitava"
        yield _c(ex, m2), (f"{nome} direta em {_par(ex, i, j)}: {m2.sup.nome}-{m2.inf.nome} "
                           f"atingida por movimento direto")


@regra("quintas_tempo_forte", "Quintas/oitavas em tempos fortes seguidos",
       "Na 2ª e 3ª espécie, 5ªs ou 8ªs em tempos fortes consecutivos soam como paralelas "
       "disfarçadas.")
def quintas_tempo_forte(ex, ctx):
    for i, j in a.pares_de_vozes(ex, ctx.so_externas):
        fortes = [m for m in a.momentos(ex, i, j) if m.completo and ex.eh_tempo_forte(m.t)]
        for m1, m2 in zip(fortes, fortes[1:]):
            if ex.compasso_de(m2.t) != ex.compasso_de(m1.t) + 1:
                continue
            if m2 is fortes[-1] and m2.t >= ex.fim - ex.duracao_compasso:
                continue  # a 8ª da cadência final é esperada
            if m1.sup.ps == m2.sup.ps or m1.inf.ps == m2.inf.ps:
                continue
            if m2.sup.inicio == m1.sup.fim and m2.inf.inicio == m1.inf.fim:
                continue  # sem notas no meio: já é paralela comum
            c1 = a.classe_perfeita(a.harmonico(m1.sup, m1.inf))
            if c1 and c1 == a.classe_perfeita(a.harmonico(m2.sup, m2.inf)):
                yield _c(ex, m2), (f"{_par(ex, i, j)}: {'5ª' if c1 == '5' else '8ª'} em tempos "
                                   f"fortes seguidos ({m1.sup.nome}-{m1.inf.nome} → "
                                   f"{m2.sup.nome}-{m2.inf.nome})")


@regra("paralelas_imperfeitas_excessivas", "Terças ou sextas paralelas demais",
       "Mais de três 3ªs (ou 6ªs) paralelas seguidas tiram a independência das vozes.")
def paralelas_imperfeitas_excessivas(ex, ctx):
    for i, j in a.pares_de_vozes(ex, ctx.so_externas):
        seq, tipo = 0, None
        for m1, m2 in a.sucessoes(ex, i, j):
            g1 = a.harmonico(m1.sup, m1.inf).generic.simpleUndirected
            g2 = a.harmonico(m2.sup, m2.inf).generic.simpleUndirected
            paralelo = (g1 == g2 and g1 in (3, 6)
                        and a.direcao(m1.sup, m2.sup) == a.direcao(m1.inf, m2.inf) != 0)
            if paralelo and g2 == tipo:
                seq += 1
            elif paralelo:
                seq, tipo = 2, g2
            else:
                seq, tipo = 0, None
            if seq == 4:
                yield _c(ex, m2), f"{_par(ex, i, j)}: quatro {tipo}ªs paralelas seguidas"


@regra("unissono_interno", "Uníssono no meio do exercício",
       "No contraponto estrito o uníssono só aparece no começo e no fim.")
def unissono_interno(ex, ctx):
    for i, j in a.pares_de_vozes(ex, ctx.so_externas):
        ms = [m for m in a.momentos(ex, i, j) if m.completo]
        for m in ms[1:-1]:
            if m.sup.ps == m.inf.ps and (m.ataca_sup() or m.ataca_inf()):
                yield _c(ex, m), f"{_par(ex, i, j)}: uníssono em {m.sup.nome}"


@regra("cruzamento_de_vozes", "Cruzamento de vozes",
       "Uma voz não passa abaixo da voz que está embaixo dela (nem acima da que está em cima).")
def cruzamento_de_vozes(ex, ctx):
    for i in range(len(ex.vozes) - 1):
        for m in a.momentos(ex, i, i + 1):
            if m.completo and m.sup.ps < m.inf.ps:
                yield _c(ex, m), (f"{_v(ex, i)} ({m.sup.nome}) está abaixo de "
                                  f"{_v(ex, i + 1)} ({m.inf.nome})")


@regra("sobreposicao_de_vozes", "Sobreposição de vozes",
       "Uma voz não deve ir além da nota que a voz vizinha acabou de tocar.")
def sobreposicao_de_vozes(ex, ctx):
    for i in range(len(ex.vozes) - 1):
        for m1, m2 in a.sucessoes(ex, i, i + 1):
            if m2.ataca_inf() and m2.inf.ps > m1.sup.ps:
                yield _c(ex, m2), (f"{_v(ex, i + 1)} sobe para {m2.inf.nome}, acima do "
                                   f"{m1.sup.nome} anterior de {_v(ex, i)}")
            elif m2.ataca_sup() and m2.sup.ps < m1.inf.ps:
                yield _c(ex, m2), (f"{_v(ex, i)} desce para {m2.sup.nome}, abaixo do "
                                   f"{m1.inf.nome} anterior de {_v(ex, i + 1)}")


@regra("espacamento", "Espaçamento entre vozes",
       "A duas vozes, no máximo uma 10ª entre elas. A três ou mais, vozes superiores "
       "vizinhas ficam a no máximo uma 8ª (entre tenor e baixo pode ser mais).")
def espacamento(ex, ctx):
    n = len(ex.vozes)
    if n == 2:
        if ctx.nivel > 5:
            return  # o limite de uma 10ª é do contraponto a duas vozes, não da textura de piano
        pares, limite = [(0, 1)], 10
    else:
        pares, limite = [(i, i + 1) for i in range(n - 2)], 8
    for i, j in pares:
        vistos = set()
        for m in a.momentos(ex, i, j):
            if not m.completo or (id(m.sup), id(m.inf)) in vistos:
                continue
            vistos.add((id(m.sup), id(m.inf)))
            iv = a.harmonico(m.sup, m.inf)
            if iv.generic.undirected > limite or (limite == 8 and iv.semitones > 12):
                yield _c(ex, m), (f"{_par(ex, i, j)}: {m.sup.nome} e {m.inf.nome} estão "
                                  f"a mais de uma {limite}ª")


EXTENSOES = {  # (grave, agudo) para escrita coral
    "soprano": ("C4", "G5"),
    "contralto": ("G3", "D5"),
    "alto": ("G3", "D5"),
    "tenor": ("C3", "G4"),
    "baixo": ("E2", "C4"),
}


@regra("extensao_da_voz", "Extensão das vozes do coral",
       "Soprano C4–G5, contralto G3–D5, tenor C3–G4, baixo E2–C4. "
       "Só vale para vozes com esses nomes.")
def extensao_da_voz(ex, ctx):
    from music21 import pitch
    for v in ex.vozes:
        lim = EXTENSOES.get(v.nome.lower())
        if lim is None:
            continue
        grave, agudo = pitch.Pitch(lim[0]).ps, pitch.Pitch(lim[1]).ps
        for n in v.notas:
            if not grave <= n.ps <= agudo:
                yield _c(ex, n), f"{v.nome}: {n.nome} fora da extensão ({lim[0]}–{lim[1]})"


# ---------------------------------------------------------------- melodia

@regra("salto_maior_que_oitava", "Salto maior que uma 8ª",
       "Nenhuma voz salta mais que uma oitava.")
def salto_maior_que_oitava(ex, ctx):
    for v in ex.vozes:
        for n1, n2 in v.pares_melodicos():
            if abs(n2.ps - n1.ps) > 12:
                yield _c(ex, n2), f"{v.nome}: salto de {n1.nome} para {n2.nome}"


@regra("intervalo_melodico_aumentado_diminuto", "Intervalo melódico aumentado ou diminuto",
       "A melodia evita intervalos aumentados e diminutos (trítono, 2ª aumentada, 4ª diminuta…) "
       "e cromatismos.")
def intervalo_melodico_aumentado_diminuto(ex, ctx):
    for v in ex.vozes:
        for n1, n2 in v.pares_melodicos():
            iv = a.intervalo(n1, n2)
            if iv.name[0] in "Ad":
                yield _c(ex, n2), f"{v.nome}: {a.nome_intervalo(iv)} de {n1.nome} para {n2.nome}"


@regra("salto_de_sexta_ou_setima", "Salto de 6ª ou 7ª",
       "No estilo estrito não se salta 7ª nem 6ª maior; a 6ª menor só ascendente.")
def salto_de_sexta_ou_setima(ex, ctx):
    for v in ex.vozes:
        for n1, n2 in v.pares_melodicos():
            iv = a.intervalo(n1, n2)
            g = iv.generic.undirected
            if g == 7 or (g == 6 and not (iv.name == "m6" and n2.ps > n1.ps)):
                yield _c(ex, n2), f"{v.nome}: salto de {a.nome_intervalo(iv)} ({n1.nome}→{n2.nome})"


@regra("salto_nao_compensado", "Salto grande sem compensação",
       "Depois de um salto maior que uma 4ª justa, a melodia muda de direção.")
def salto_nao_compensado(ex, ctx):
    for v in ex.vozes:
        pares = v.pares_melodicos()
        for (n1, n2), (m1, n3) in zip(pares, pares[1:]):
            if m1 is not n2 or abs(n2.ps - n1.ps) <= 5:
                continue
            if a.direcao(n2, n3) == a.direcao(n1, n2):
                yield _c(ex, n3), (f"{v.nome}: depois do salto {n1.nome}→{n2.nome} a melodia "
                                   f"continua na mesma direção ({n3.nome})")


@regra("saltos_consecutivos", "Saltos seguidos na mesma direção",
       "Dois saltos na mesma direção só se somarem no máximo uma 8ª (arpejo de acorde); "
       "três nunca.")
def saltos_consecutivos(ex, ctx):
    for v in ex.vozes:
        notas = v.notas
        for k in range(len(notas) - 2):
            n1, n2, n3 = notas[k:k + 3]
            if n1.fim != n2.inicio or n2.fim != n3.inicio:
                continue
            if not (a.eh_salto(n1, n2) and a.eh_salto(n2, n3)):
                continue
            if a.direcao(n1, n2) != a.direcao(n2, n3):
                continue
            n4 = notas[k + 3] if k + 3 < len(notas) else None
            tres = (n4 is not None and n3.fim == n4.inicio and a.eh_salto(n3, n4)
                    and a.direcao(n3, n4) == a.direcao(n2, n3))
            if abs(n3.ps - n1.ps) > 12 or tres:
                yield _c(ex, n3), f"{v.nome}: saltos seguidos {n1.nome}→{n2.nome}→{n3.nome}"


@regra("nota_repetida", "Nota repetida",
       "No contraponto estrito a mesma nota não é atacada duas vezes seguidas.")
def nota_repetida(ex, ctx):
    for i in _vozes_do_contraponto(ex):
        v = ex.vozes[i]
        for n1, n2 in v.pares_melodicos():
            if n1.ps == n2.ps:
                yield _c(ex, n2), f"{v.nome}: {n2.nome} repetida"


@regra("ponto_culminante", "Ponto culminante único",
       "A nota mais aguda da melodia aparece uma vez só.")
def ponto_culminante(ex, ctx):
    for i in _vozes_do_contraponto(ex):
        v = ex.vozes[i]
        if not v.notas:
            continue
        topo = max(n.ps for n in v.notas)
        cumes = [n for n in v.notas if n.ps == topo]
        if len(cumes) > 1:
            yield _c(ex, cumes[1]), (f"{v.nome}: o ponto culminante {cumes[0].nome} aparece "
                                     f"{len(cumes)} vezes")


@regra("ambito_melodico", "Âmbito da melodia",
       "Cada voz do contraponto cabe numa 10ª.")
def ambito_melodico(ex, ctx):
    for i in _vozes_do_contraponto(ex):
        v = ex.vozes[i]
        if len(v.notas) < 2:
            continue
        grave = min(v.notas, key=lambda n: n.ps)
        agudo = max(v.notas, key=lambda n: n.ps)
        if a.intervalo(grave, agudo).generic.undirected > 10:
            yield 1, f"{v.nome}: vai de {grave.nome} a {agudo.nome}, mais que uma 10ª"


# ---------------------------------------------------------------- começo e fim

@regra("inicio_perfeito", "Começo em consonância perfeita",
       "O primeiro intervalo é uníssono, 5ª ou 8ª. Se o contraponto está abaixo do cantus "
       "firmus, só uníssono ou 8ª.")
def inicio_perfeito(ex, ctx):
    par = a.par_externo(ex)
    if par is None:
        return
    ms = [m for m in a.momentos(ex, *par) if m.completo]
    if not ms:
        return
    iv = a.harmonico(ms[0].sup, ms[0].inf)
    permitidos = {"P1"} if ex.cantus_firmus == 0 else {"P1", "P5"}
    if iv.simpleName not in permitidos:
        yield _c(ex, ms[0]), f"começa com {a.nome_intervalo(iv)} entre as vozes externas"


@regra("final_perfeito", "Final em uníssono ou 8ª",
       "O último intervalo entre as vozes externas é uníssono ou 8ª.")
def final_perfeito(ex, ctx):
    par = a.par_externo(ex)
    if par is None:
        return
    ms = [m for m in a.momentos(ex, *par) if m.completo]
    if ms and a.harmonico(ms[-1].sup, ms[-1].inf).simpleName != "P1":
        iv = a.harmonico(ms[-1].sup, ms[-1].inf)
        yield _c(ex, ms[-1]), f"termina com {a.nome_intervalo(iv)} entre as vozes externas"


@regra("cadencia_contraponto", "Cadência do contraponto",
       "No fim, as vozes externas chegam ao uníssono/8ª por grau e em movimento contrário, "
       "vindas de uma 6ª maior ou 3ª menor (a sensível sobe meio tom).")
def cadencia_contraponto(ex, ctx):
    par = a.par_externo(ex)
    if par is None:
        return
    ms = [m for m in a.momentos(ex, *par) if m.completo]
    if len(ms) < 2:
        return
    pen, fim = ms[-2], ms[-1]
    c = _c(ex, fim)
    if not (a.eh_grau(pen.sup, fim.sup) and a.eh_grau(pen.inf, fim.inf)
            and a.direcao(pen.sup, fim.sup) == -a.direcao(pen.inf, fim.inf) != 0):
        yield c, "as vozes externas não chegam ao final por grau em movimento contrário"
        return
    iv = a.harmonico(pen.sup, pen.inf)
    if iv.simpleName not in ("M6", "m3"):
        yield c, (f"o penúltimo intervalo é {a.nome_intervalo(iv)}; esperava 6ª maior ou 3ª menor "
                  f"(sensível meio tom abaixo da final)")


# ---------------------------------------------------------------- harmonia tonal

@regra("sensivel_resolve", "Sensível resolve na tônica",
       "Na voz superior, a sensível vai para a tônica quando o baixo chega à tônica.",
       precisa_tom=True)
def sensivel_resolve(ex, ctx):
    lt, ton = a.sensivel(ex), a.tonica(ex)
    if len(ex.vozes) < 2:
        return
    sup, baixo = ex.vozes[0], ex.vozes[ex.baixo]
    for n1, n2 in sup.pares_melodicos():
        if n1.altura.name != lt:
            continue
        b = baixo.soando_em(n2.inicio)
        if b is None or b.altura.name != ton:
            continue
        if not (n2.altura.name == ton and n2.ps > n1.ps):
            yield _c(ex, n2), f"{sup.nome}: sensível {n1.nome} vai para {n2.nome}, e não para {ton}"


@regra("sensivel_dobrada", "Sensível dobrada",
       "A sensível nunca é dobrada.", precisa_tom=True)
def sensivel_dobrada(ex, ctx):
    lt = a.sensivel(ex)
    tempos = sorted({n.inicio for v in ex.vozes for n in v.notas})
    for t in tempos:
        soando = [(v, v.soando_em(t)) for v in ex.vozes]
        com_lt = [v.nome for v, n in soando if n is not None and n.altura.name == lt]
        atacou = any(n is not None and n.inicio == t and n.altura.name == lt for _, n in soando)
        if len(com_lt) > 1 and atacou:
            yield ex.compasso_de(t), f"sensível {lt} dobrada em {', '.join(com_lt)}"


@regra("cadencia_autentica", "Termina em cadência",
       "O baixo termina na tônica, vindo da dominante (ou da subdominante, cadência plagal).",
       precisa_tom=True)
def cadencia_autentica(ex, ctx):
    baixo = ex.vozes[ex.baixo].notas
    ton = a.tonica(ex)
    if not baixo:
        return
    final = baixo[-1]
    if final.altura.name != ton:
        yield _c(ex, final), f"o baixo termina em {final.altura.name}, não na tônica {ton}"
        return
    anteriores = [n for n in baixo[:-1] if n.altura.name != ton]
    if not anteriores:
        return
    pen = anteriores[-1]
    dom = ex.tonalidade.tonic.transpose("P5").name
    sub = ex.tonalidade.tonic.transpose("P4").name
    if pen.altura.name not in (dom, sub):
        yield _c(ex, final), (f"o baixo chega à tônica vindo de {pen.altura.name}; "
                              f"esperava {dom} (autêntica) ou {sub} (plagal)")


def verificar(ex: Exercicio, ctx: Contexto, ids: list[str]) -> list[Achado]:
    achados = []
    for rid in ids:
        r = REGRAS[rid]
        if r.precisa_tom and ex.tonalidade is None:
            continue
        for compasso, msg in r.verificar(ex, ctx):
            achados.append(Achado(rid, compasso, msg))
    return achados

