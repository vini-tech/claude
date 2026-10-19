# Ateliê de Composição

Livro interativo de composição para piano (39 capítulos, 168 exercícios) em `web/curso.html`, com um
verificador de regras de contraponto e harmonia que corrige os exercícios. Há duas implementações do
verificador: JS (`web/motor.js` + `web/regras2.js` + `web/regras3.js`, usada pela página) e Python
(`verificador/`, linha de comando). Visão geral e mapa dos arquivos: `README.md`.

## Verificação (obrigatória antes de dizer que terminou)

```
node tests/validar_temas.js        # tem de imprimir []
python -m pytest -q                # tudo passa
node tests/medir_texto.js <id> …   # limites de texto por campo (guia de enxugar)
```

Um hook de `Stop` (`.claude/hooks/verificar.js`) roda os dois primeiros quando há mudança em `web/`,
`tests/` ou `verificador/` e devolve a falha para você corrigir. Se a falha for de outro autor ou de
outro capítulo, diga isso ao usuário em vez de mexer.

Para mudanças visuais, veja a página de verdade: `.claude/launch.json` sobe `web/` em
http://localhost:8765 (abra `/curso.html`); confira no celular (375 px) e no desktop. `curso.html` não
declara `<meta charset>`: o servidor de `.claude/servidor.py` manda `charset=utf-8`; outro servidor pode
quebrar os acentos e a página.

## Onde fica cada coisa

- `web/temas.js`: níveis, perfis comuns (`TEMAS.perfis`) e `TEMAS.inserir` / `TEMAS.perguntas`.
- `web/livro/*.js`: **todos os capítulos**, um módulo por assunto; a ordem de carga está em
  `web/livro/indice.js` (`nivel1`, `nivel2`, `nivel3` primeiro). Capítulo novo = módulo novo + nome no índice.
- `web/livro/perguntas-*.js`: as 3 perguntas de antes dos exercícios de cada capítulo.
- `web/oficina.js` (editor com piano), `web/partitura.js`, `web/estilo.js`, `web/buscador.js`, `web/transpor.js`.
- Pesquisa de base: `research_notes/O que se ensina em composição/`, `reports/`, `pesquisa/`.

## Guias (leia o certo antes de começar)

| tarefa | guia |
|---|---|
| escrever ou mudar capítulo, exemplo, exercício, cifra, perfil, regra | `docs/guia-capitulos.md` |
| cortar texto | `docs/guia-enxugar.md` |
| perguntas de antes dos exercícios | `docs/guia-perguntas.md` |

## Regras que não se quebram

- **Não invente fatos musicais.** Só cite obras e procedimentos de que tenha certeza; compasso exato só
  se souber. Exemplos reconstruídos da pesquisa são conferidos no verificador.
- Toda partitura, solução e alternativa com `verificar` passa pelo `validar_temas.js`. Não mude
  partituras, soluções, cifras, ids, perfis ou o índice da alternativa certa sem rodar o validador.
- Nas perguntas a alternativa certa é a indicada por `c` (padrão 0, a primeira).
- Português do Brasil, técnico e enxuto; o leitor já sabe teoria.
- O verificador trabalha com **duas vozes** (ou uma): não há coral a quatro vozes.
- Vários autores podem trabalhar ao mesmo tempo, cada um no seu módulo: não edite módulos alheios.
- No Windows, `subprocess` em Python precisa de `encoding="utf-8"` para ler a saída do node.

## Agentes e comandos do projeto

- Subagente `autor-capitulo` (`.claude/agents/`): escreve um capítulo; um hook o impede de editar fora de `web/livro/`.
- Subagente `revisor-musical`: só lê e aponta erros musicais e fatos duvidosos; não edita.
- Comandos: `/novo-capitulo`, `/enxugar`, `/perguntas`, `/pesquisar` (`.claude/skills/`).
- Antes de construir algo que talvez já exista, ou ao procurar ferramenta/biblioteca/plugin, siga
  `/pesquisar`: todas as fontes (Anthropic Directory, skills, registro MCP, web em modo extended,
  GitHub/npm/PyPI, ISMIR), candidatos verificados no repositório, não só no resumo da busca.

## Papéis (duas sessões: programador e melhorador)

Padrão Escritor/Revisor: quem escreve não é quem revisa, e quem revisa não corrige o código do outro.

| | programador | melhorador |
|---|---|---|
| escreve em | `web/`, `verificador/`, `tests/`, `README.md` | `.claude/`, `CLAUDE.md`, `docs/` |
| faz | capítulos, regras, interface, testes | revisão, ambiente do agente (hooks, agentes, comandos), guias, pesquisa de ferramentas |
| não faz | mudar `.claude/` ou `CLAUDE.md` sem combinar | editar arquivos do programador |

- Cada sessão trabalha na **sua worktree** (no app: nova sessão em worktree) e entrega por branch; o
  merge no `master` só acontece com a verificação passando. Duas sessões na mesma pasta se atropelam.
- O melhorador que achar um problema no código **manda por mensagem** (arquivo, linha, evidência, por
  que importa); o programador corrige.
- Ciclo de cada mudança: programador escreve → Stop hook verifica → `/code-review` e `revisor-musical`
  (contexto limpo) → melhorador revisa o branch → programador corrige. **No máximo duas rodadas** de
  revisão; depois decide o usuário.
- Revisão aponta só o que afeta a correção (musical ou de código) ou o pedido do usuário; preferência
  de estilo é opcional. Revisor que procura lacuna sempre acha alguma: não persiga todas.

## Hábitos

- Mudança grande: plano primeiro (modo de plano), depois execução.
- Um commit por capítulo ou assunto, não commits "(parcial)".
- Antes de cada commit, rode `/code-review` e a verificação acima.
