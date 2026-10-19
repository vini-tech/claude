---
name: pesquisar
description: Pesquisa ampla de ferramentas, bibliotecas, plugins, MCPs ou fontes para o ateliê antes de decidir. Use quando o usuário pedir "o que existe para…", "tem ferramenta melhor para…", ou antes de construir algo do zero que talvez já exista.
argument-hint: "<pergunta: o que precisa ser resolvido>"
---

Pergunta: $ARGUMENTS

Uma pesquisa fraca olha só um lugar e para nos primeiros resultados. Siga o protocolo inteiro.

## 1. Defina antes de buscar
- O problema em uma frase e **o que o projeto já usa hoje** para isso (leia o código: ex. `web/partitura.js`
  desenha SVG próprio, `web/som.js` é síntese por osciladores, `web/motor.js` é o verificador).
- Critérios de decisão: roda no navegador sem build? licença compatível? mantido (commit no último ano)?
  funciona offline? custo de troca?

## 2. Busque em TODAS as fontes (em paralelo; se a pergunta for grande, um subagente por fonte)
| fonte | como |
|---|---|
| Plugins do Anthropic Directory (catálogo grande da conta, não só o marketplace local) | `SearchPlugins` com 6–8 palavras-chave variadas |
| Skills da conta | `SearchSkills` |
| Conectores MCP | `search_mcp_registry` |
| Web geral | `WebSearch` em modo `extended`, 3+ consultas com termos diferentes (inglês e português) |
| Código aberto | GitHub topics (`music-notation`, `counterpoint`, `music-theory`, `web-audio`), npm, PyPI |
| Acadêmico (música computacional) | ISMIR / TISMIR, arXiv, corpora (When in Rome, DCML, music21 corpus) |
| Documentação de biblioteca | plugin context7, ou a doc oficial via `WebFetch` |

Não pare na primeira fonte que responder. Procure também **alternativas ao que já existe no projeto**.

## 3. Verifique cada candidato (não confie no resumo da busca)
- Abra o repositório ou o pacote: última versão, data do último commit, licença, issues abertas.
- Se possível, teste de verdade em pasta temporária (`npm view <pkg>`, `pip index versions <pkg>`,
  um script mínimo). Marque como "não verificado" o que só viu em snippet.

## 4. Entregue
Tabela: candidato · o que resolve · fonte · licença · último commit · verificado? · custo de adoção.
Depois: recomendação (uma, com o porquê), o que **não** vale a pena e por quê, o que ficou sem
resposta. Liste as URLs usadas. Não instale nem mude o projeto sem o usuário aprovar.
