from pathlib import Path

import pytest

from verificador import NIVEIS, REGRAS, TABELA, ler, ler_texto, verificar

EXEMPLOS = Path(__file__).parent.parent / "exercicios" / "exemplos"


def regras_violadas(texto: str, nivel: int, sev: str | None = None) -> set[str]:
    r = verificar(ler_texto(texto), nivel)
    return {a.regra for s, a in r.achados if sev is None or s == sev}


def duas_vozes(sup: str, inf: str, extra: str = "") -> str:
    return f"{extra}\nsup: {sup}\ninf: {inf}\n"


def test_tabela_cobre_todas_as_regras_e_todos_os_niveis():
    assert set(TABELA) == set(REGRAS)
    for linha in TABELA.values():
        assert len(linha.split()) == len(NIVEIS)
        assert set(linha.split()) <= {"E", "A", "I", "-"}


@pytest.mark.parametrize("arquivo,nivel", [
    ("nivel01-fux-dorico.txt", 1),
    ("nivel02-fux-dorico.txt", 2),
    ("nivel04-fux-dorico.txt", 4),
    ("nivel06-coral-do-maior.txt", 6),
])
def test_exemplos_corretos_passam(arquivo, nivel):
    assert verificar(ler(EXEMPLOS / arquivo), nivel).aprovado


def test_exemplo_com_erros_fica_mais_leve_a_cada_nivel():
    ex = ler(EXEMPLOS / "nivel02-com-erros.txt")
    erros = [verificar(ex, n).contar("erro") for n in range(2, 11)]
    assert erros[0] > 0 and erros[-1] == 0
    assert verificar(ex, 10).contar("info") > 0


def test_quintas_paralelas():
    txt = duas_vozes("A4/4 B4 C5", "D4/4 E4 C4")
    assert "quintas_paralelas" in regras_violadas(txt, 1)
    assert "quintas_paralelas" in regras_violadas(txt, 9, "aviso")
    assert "quintas_paralelas" in regras_violadas(txt, 10, "info")


def test_quintas_por_movimento_contrario():
    assert "quintas_paralelas" in regras_violadas(duas_vozes("A4/4 C5", "D4/4 F3"), 1)


def test_oitavas_paralelas():
    assert "oitavas_paralelas" in regras_violadas(duas_vozes("D5/4 E5", "D4/4 E4"), 1)


def test_oitava_direta_no_estilo_estrito():
    assert "quintas_oitavas_ocultas" in regras_violadas(duas_vozes("E5/4 G5", "C4/4 G4"), 1)
    # contrário: não é direta
    assert "quintas_oitavas_ocultas" not in regras_violadas(duas_vozes("E5/4 D5", "C4/4 D4"), 1)


def test_dissonancia_na_primeira_especie():
    assert "dissonancia_proibida" in regras_violadas(duas_vozes("D5/4 E5", "D4/4 D4"), 1)


def test_quarta_contra_o_baixo_e_dissonante():
    assert "dissonancia_proibida" in regras_violadas(duas_vozes("G4/4", "D4/4"), 1)


def test_nota_de_passagem_e_aceita_na_segunda_especie():
    txt = duas_vozes("A4/2 G4 F4/4", "D4/4 D4", "compasso: 2/2")
    viol = regras_violadas(txt, 2, "erro")
    assert not viol & {"dissonancia_aproximacao", "dissonancia_resolucao", "dissonancia_tempo_forte"}


def test_dissonancia_por_salto_na_segunda_especie():
    txt = duas_vozes("A4/2 E4 F4/4", "D4/4 D4", "compasso: 2/2")
    viol = regras_violadas(txt, 2, "erro")
    assert "dissonancia_aproximacao" in viol  # A4 -> E4 (2ª contra o D4) por salto


def test_bordadura_so_da_terceira_especie_em_diante():
    txt = duas_vozes("F4/2 E4 F4/4", "D4/4 D4", "compasso: 2/2")
    assert "bordadura_na_2a_especie" in regras_violadas(txt, 2)
    assert "bordadura_na_2a_especie" not in regras_violadas(txt, 3)


def test_retardo_preparado_e_resolvido():
    # D5 é consonante com F4, fica soando contra E4 (7ª) e resolve em C5
    txt = duas_vozes("P/2 D5/2~ D5 C5 D5/4", "F4/4 E4 D4", "compasso: 2/2")
    viol = regras_violadas(txt, 4, "erro")
    assert "retardo_resolve_descendo" not in viol
    assert "dissonancia_tempo_forte" not in viol
    assert "retardo_nao_permitido" in regras_violadas(txt, 2)


def test_retardo_que_resolve_para_cima():
    txt = duas_vozes("P/2 D5/2~ D5 E5 D5/4", "F4/4 E4 D4", "compasso: 2/2")
    assert "retardo_resolve_descendo" in regras_violadas(txt, 4, "erro")


def test_cruzamento_de_vozes():
    assert "cruzamento_de_vozes" in regras_violadas(duas_vozes("C4/4", "E4/4"), 1)


def test_saltos_melodicos():
    viol = regras_violadas(duas_vozes("C4/4 B4 C4 D5 D4", "C3/4 C3 C3 C3 C3"), 1)
    assert "salto_de_sexta_ou_setima" in viol
    assert "salto_maior_que_oitava" in viol


def test_intervalo_aumentado():
    assert "intervalo_melodico_aumentado_diminuto" in regras_violadas(
        duas_vozes("F4/4 B4", "D4/4 D4"), 1)


def test_cadencia_do_contraponto():
    ok = duas_vozes("A4/4 C#5 D5", "D4/4 E4 D4")
    ruim = duas_vozes("A4/4 A4 D5", "D4/4 A3 D4")
    assert "cadencia_contraponto" not in regras_violadas(ok, 1)
    assert "cadencia_contraponto" in regras_violadas(ruim, 1)


def test_sensivel_dobrada_e_sem_resolucao():
    txt = """tom: C maior
soprano: B4/4 D5
contralto: G4/4 G4
tenor: B3/4 E4
baixo: G3/4 C3
"""
    viol = regras_violadas(txt, 6)
    assert "sensivel_dobrada" in viol
    assert "sensivel_resolve" in viol


def test_regras_tonais_sao_puladas_sem_tonalidade():
    r = verificar(ler_texto(duas_vozes("B4/4 C5", "G3/4 C4")), 6)
    assert "sensivel_resolve" in r.nao_verificadas


def test_ligadura_junta_as_notas():
    ex = ler_texto("v: C4/2~ C4/2 D4/4\n")
    assert [(n.nome, n.duracao) for n in ex.vozes[0].notas] == [("C4", 4), ("D4", 4)]


def test_bemol_e_sustenido_no_texto():
    ex = ler_texto("v: Bb3/4 F#4 E-4\n")
    assert [n.nome for n in ex.vozes[0].notas] == ["B-3", "F#4", "E-4"]


def test_le_musicxml(tmp_path):
    from music21 import note, stream
    s = stream.Score()
    for nome, alturas in (("sup", ["A4", "B4", "C5"]), ("inf", ["D4", "E4", "C4"])):
        p = stream.Part()
        p.partName = nome
        for a in alturas:
            p.append(note.Note(a, quarterLength=4))
        s.insert(0, p)
    arq = tmp_path / "ex.musicxml"
    s.write("musicxml", fp=str(arq))
    ex = ler(arq)
    assert [v.nome for v in ex.vozes] == ["sup", "inf"]
    r = verificar(ex, 1)
    assert "quintas_paralelas" in {a.regra for _, a in r.achados}


def test_cambiata_da_terceira_especie():
    # C5 é 7ª contra o D4, chega por grau descendente, salta uma 3ª para baixo e volta por grau
    txt = duas_vozes("D5/1 C5 A4 B4 A4/4", "D4/4 F4")
    assert "dissonancia_resolucao" not in regras_violadas(txt, 3)
    assert "dissonancia_resolucao" in regras_violadas(txt, 2)
