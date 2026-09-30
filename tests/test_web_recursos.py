"""Recursos só da versão web: sorteio de cantus firmus, correção em andamento e explicações."""

import json
import shutil
import subprocess
from pathlib import Path

import pytest

RAIZ = Path(__file__).parent.parent
pytestmark = pytest.mark.skipif(shutil.which("node") is None, reason="node não instalado")


def js(codigo: str):
    prefixo = (f"const M = require({json.dumps(str(RAIZ / 'web' / 'motor.js'))});"
               f"const C = require({json.dumps(str(RAIZ / 'web' / 'cantus.js'))});"
               f"const E = require({json.dumps(str(RAIZ / 'web' / 'editor.js'))});")
    r = subprocess.run(["node", "-e", prefixo + codigo], capture_output=True, text=True, check=True)
    return json.loads(r.stdout)


def test_todas_as_regras_tem_explicacao():
    faltando = js("console.log(JSON.stringify(Object.values(M.REGRAS).filter(r => !r.porque || !r.corrigir).map(r => r.id)))")
    assert faltando == []


def test_cantus_sorteados_sao_bons_e_tem_solucao():
    """200 cantus firmi: melodia sem erros nem avisos no nível 1, e contrapontos sem erros acima e abaixo."""
    r = js("""
    const rng = C.rngDe(1725), problemas = [];
    for (let i = 0; i < 200; i++) {
      const cf = C.sortear(rng);
      if (!cf) { problemas.push('não sorteou'); continue; }
      const cant = 'cantus: ' + cf.notas.split(' ').map((n, k) => k ? n : n + '/4').join(' ');
      const so = M.verificar(M.lerTexto(cant + '\\n'), 1);
      const melodia = so.achados.filter(a => a.regra !== 'ritmo_da_especie');
      if (melodia.length) problemas.push(cf.notas + ': ' + melodia.map(a => a.regra).join(','));
      const n = cf.alturas.length;
      if (n < 8 || n > 12) problemas.push('tamanho ' + n);
      if (cf.alturas[0].nome !== cf.alturas[n - 1].nome) problemas.push('não termina na final');
      for (const pos of ['acima', 'abaixo']) {
        const cp = C.contraponto(cf.alturas, cf.tom, pos, rng);
        if (!cp) { problemas.push('sem solução ' + pos + ': ' + cf.notas); continue; }
        const l = (nome, alts) => nome + ': ' + alts.map((a, k) => a.nomeOitava.replace(/-/g, 'b') + (k ? '' : '/4')).join(' ');
        const txt = 'cf: cantus\\ntom: ' + cf.tom + '\\n' + (pos === 'acima'
          ? l('cp', cp) + '\\n' + l('cantus', cf.alturas) : l('cantus', cf.alturas) + '\\n' + l('cp', cp)) + '\\n';
        const res = M.verificar(M.lerTexto(txt), 1);
        if (res.contar('erro')) problemas.push(pos + ' com erro: ' + txt);
      }
    }
    console.log(JSON.stringify(problemas));
    """)
    assert r == []


def correcao(texto: str, nivel: int):
    return js(f"""
    const txt = {json.dumps(texto)};
    const modelo = E.ler(txt), ex = M.lerTexto(txt);
    const fins = modelo.vozes.map(v => E.inicios(v).fim);
    const v = M.concluidos(ex, M.verificar(ex, {nivel}), fins);
    console.log(JSON.stringify({{completo: v.completo, compassos: v.compassosCompletos, pendentes: v.pendentes,
      regras: v.visiveis.map(a => [a.regra, a.compasso])}}));
    """)


CF = "cantus: D4/4 F4 E4 D4 G4 F4 A4 G4 F4 E4 D4\n"


def test_erro_so_aparece_com_o_compasso_completo():
    # 5ªs paralelas entre os compassos 1 e 2 (A4-D4 → C5-F4)
    so_um = correcao("cf: cantus\ncp: A4/4\n" + CF, 1)
    assert so_um["compassos"] == 1 and not so_um["completo"]
    assert ("quintas_paralelas", 2) not in [tuple(x) for x in so_um["regras"]]
    dois = correcao("cf: cantus\ncp: A4/4 C5\n" + CF, 1)
    assert ("quintas_paralelas", 2) in [tuple(x) for x in dois["regras"]]


def test_regras_do_fim_esperam_o_exercicio_inteiro():
    parcial = correcao("cf: cantus\ncp: A4/4 A4 G4\n" + CF, 1)
    regras = {r for r, _ in parcial["regras"]}
    assert not regras & {"final_perfeito", "cadencia_contraponto", "ponto_culminante"}
    assert parcial["pendentes"] > 0


def test_resolucao_da_dissonancia_espera_a_proxima_nota():
    # 2ª espécie: G4 no tempo fraco é 4ª contra o D4 (nota de passagem A4-G4-F4); a resolução ainda não foi escrita
    base = "compasso: 2/2\ncf: cantus\n"
    parcial = correcao(base + "cp: A4/2 G4\n" + CF, 2)
    assert "dissonancia_resolucao" not in {r for r, _ in parcial["regras"]}
    salto = correcao(base + "cp: A4/2 G4 D5/2\n" + CF, 2)
    assert "dissonancia_resolucao" in {r for r, _ in salto["regras"]}


def test_exercicio_completo_mostra_tudo():
    completo = correcao("cf: cantus\ncp: A4/4 A4 G4 A4 B4 C5 C5 B4 D5 C#5 D5\n" + CF, 1)
    assert completo["completo"] and completo["pendentes"] == 0


def test_editor_ida_e_volta():
    texto = "titulo: t\ncompasso: 2/2\ncf: cantus\n\ncp: P/2 A4/2~ A4 D5/1.5 C5/0.5\n" + CF
    r = js(f"""const orig = {json.dumps(texto)}; const t = E.escrever(E.ler(orig));
      const notas = (x) => M.lerTexto(x).vozes.map(v => v.notas.map(n => [n.nome, n.inicio, n.duracao]));
      console.log(JSON.stringify([t, E.escrever(E.ler(t)), notas(orig), notas(t)]));""")
    assert r[0] == r[1]  # escrever é estável
    assert r[2] == r[3]  # e não muda nenhuma nota


def test_conteudo_do_curso_e_valido():
    """Partituras, alvos das perguntas 'ache o erro', soluções das práticas e geradores."""
    r = subprocess.run(["node", str(RAIZ / "tests" / "validar_curso.js")], capture_output=True, text=True, check=True)
    assert json.loads(r.stdout) == []
