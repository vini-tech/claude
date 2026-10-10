# Composição para piano: da regra à liberdade

Um projeto de estudo de composição erudita em duas partes:

- **[`curriculo/`](curriculo/README.md)**: dez níveis, do contraponto de 1ª espécie à escrita livre para piano.
- **[`verificador/`](verificador/)**: um programa que corrige os exercícios. Nos primeiros níveis ele aplica todas as regras de harmonia, contraponto e melodia com rigor total. A cada nível, algumas regras passam de **erro** para **aviso**, depois para **info** (a quebra é mostrada, mas permitida) e por fim são desligadas.

```
nível  1  contraponto 1ª espécie      ████████████  tudo é erro
nível  4  4ª espécie (retardos)       ██████████░░
nível  6  harmonia a 4 vozes          ████████░░░░
nível  8  estilo clássico ao piano    █████░░░░░░░
nível 10  escrita livre               █░░░░░░░░░░░  quase tudo é info
```

## Versão 3: o ateliê de composição (um livro em 39 capítulos)

`web/curso.html` ensina **ofício de composição**, não teoria, a quem já sabe a teoria. O conteúdo vem
de duas pesquisas: [como as grandes escolas ensinavam](reports/Como%20se%20ensina%20composição.md) e
[o que elas ensinavam](research_notes/O%20que%20se%20ensina%20em%20composição/). Cada capítulo traz
**a regra como os tratados a ensinavam** e depois **como os compositores a quebraram**, com profundidade
proporcional à importância (modulação: 4 capítulos; nona de dominante: 1 curto).

- **Nível 1 · A linha a duas vozes (8):** modos, 1ª a 4ª espécie, contraponto florido, invertível, imitação e cânone.
- **Nível 2 · Das vozes à harmonia (12):** regra da oitava, cadências, função e progressão, o baixo, notas fora do acorde, retardos, três capítulos de sétimas, ritmo harmônico, sequências, esquemas galantes.
- **Nível 3 · A frase e o tema (7):** esqueleto e superfície, motivo e variação, sentença, período, expansão da frase, binária/ternária/minueto, tema e variações.
- **Nível 4 · Cromatismo e modulação (12):** dominantes e sensíveis secundárias, empréstimo modal, napolitana, sextas aumentadas (2), modulação diatônica, cromática, enarmônica e na forma, nona de dominante, cromatismo linear.

São 168 exercícios, todos com solução conferida pelo verificador (`node tests/validar_temas.js`). Os
capítulos dos níveis novos ficam em `web/livro/*.js` (ordem em `web/livro/indice.js`); o formato e as
regras estão em [`docs/guia-capitulos.md`](docs/guia-capitulos.md). As cifras aceitam inversões,
secundárias (`V43/V`), empréstimo (`bVI`), `N6`, `It6 Fr43 Ger65`, `V9`, troca de tom (`G:ii6`) e pivô
(`vi=G:ii`, inclusive enarmônico).

Cada tema tem: um **esboço** antes da aula (sem correção); uma aula curta e técnica; um **exemplo
em camadas** escrito como diário de decisões (decisão, alternativa descartada, checagem) com uma
pausa para você responder; um **contraste** entre duas versões corretas; e **exercícios** em ordem
(completar → menos apoio → restrição → livre → variante). Antes do primeiro exercício de cada tema há
três perguntas obrigatórias de múltipla escolha sobre as decisões do tema; a correção é compasso a
compasso; depois da aprovação, três perguntas calculadas da sua própria partitura (clímax,
consonâncias, movimento, inversões, ritmo harmônico) obrigam a relê-la, e só então aparecem o
relatório de estilo e a versão do professor (nos cantus sorteados ela é composta na hora pelo
buscador). Apagar uma nota no meio da voz a troca por uma pausa de mesmo valor, e mudar a duração
no meio não desloca o resto.

Enquanto você escreve, a partitura mostra o intervalo de cada nota com a outra voz (ou o intervalo
melódico, numa voz só) e as cifras, em vermelho quando há erro e em âmbar quando há aviso; a lista
de correção com as explicações só aparece ao tocar em **Terminei**. Acima da partitura fica a escala
do modo do exercício, e o piano marca a nota selecionada e a da outra voz no mesmo instante.

| arquivo | o que tem |
|---------|-----------|
| `web/temas.js` | todo o conteúdo: aulas, exemplos, contrastes e exercícios com soluções |
| `web/regras3.js` | cifras (I6, V43, ii6, I64…) e restrições dos exercícios |
| `web/buscador.js` | acha soluções de 1ª a 3ª espécie com o próprio verificador |
| `web/estilo.js` | o relatório de estilo (descritivo, não corrige) |
| `web/questoes.js` | as perguntas de depois, calculadas da partitura do aluno |
| `web/transpor.js` | transpõe exercícios (treinos em todos os tons) |
| `web/oficina.js` | o editor com piano usado nos exercícios |
| `tests/validar_temas.js` | confere cada exemplo, contraste e solução no verificador |

### O que o ateliê faz que um livro não faz

A pesquisa em [`reports/Como se ensina composição.md`](reports/Como%20se%20ensina%20composição.md)
mostra que as grandes escolas (Fux e Albrechtsberger, Nápoles, Bach, Mozart com Attwood, Paris,
Schoenberg, Boulanger) dividem um método: material reduzido, uma variável por vez, **correção
individual e explicada**, repetição diária e uma peça inteira no fim. O ateliê tenta dar isso a quem
estuda sozinho:

- **Correção com conserto (Albrechtsberger, Mozart):** em cada erro, o app procura as trocas de uma
  nota que o resolvem sem criar outro, e mostra "se trocar X por Y, este erro some"; dá para ouvir o
  trecho como está e com a troca, e aplicar.
- **Outra solução (Schoenberg):** depois de aprovado, o desafio de uma segunda solução correta e
  diferente de verdade (pelo menos 30% das notas), comparada lado a lado com a primeira.
- **Treino de hoje (Paris, Boulanger):** uma sessão curta por dia, com revisão dirigida às regras que
  você mais quebrou nas últimas semanas, o treino transposto do dia e o próximo passo; conta os dias
  seguidos.
- **Em todos os tons (Nápoles):** a regra da oitava é treinada num tom diferente a cada dia.

## Versão web (celular)

A pasta [`web/`](web/) tem o mesmo verificador em JavaScript, numa página que funciona no
navegador do celular: você escreve no piano (com duração, pausa, ponto e ligadura), sorteia
cantus firmi, escolhe o nível, vê a partitura com os erros marcados e ouve o resultado.

| arquivo | o que tem |
|---------|-----------|
| `web/index.html` | a página |
| `web/motor.js` | as regras e a tabela de níveis, portadas do Python |
| `web/editor.js` | o modelo que o piano edita, e a conversão para o formato de texto |
| `web/cantus.js` | sorteio de cantus firmi; cada um só é aceito se existir contraponto de 1ª espécie sem erros acima e abaixo dele |
| `web/exemplos.js` | os exemplos de `exercicios/exemplos/`, gerados por `python web/gerar_exemplos.py` |

Na versão web um erro só aparece quando todas as vozes completaram o compasso dele; as regras
que dependem do fim (cadência, final, ponto culminante) esperam o exercício inteiro. Cada erro
traz uma explicação de por que é um problema e de como corrigir.

`tests/test_web.py` roda os dois verificadores (Python e JavaScript) em todos os exemplos e em
400 exercícios aleatórios, nos 10 níveis, e exige resultados idênticos. Quando mudar uma regra
ou a tabela em Python, mude também em `web/motor.js` e rode os testes.

## Instalação

```
pip install -e .
```

(Precisa de Python 3.10+; instala o [music21](https://web.mit.edu/music21/).)

## Uso

```
python -m verificador exercicios/exemplos/nivel01-fux-dorico.txt --nivel 1
```

```
Fux, cantus firmus em ré, contraponto acima — nível 1: Contraponto a 2 vozes, 1ª espécie (nota contra nota)
vozes: contraponto, cantus · tom: D dorian

  c.2   AVISO contraponto: A4 repetida  [nota_repetida]
  c.7   AVISO contraponto: C5 repetida  [nota_repetida]
  c.11  AVISO contraponto: o ponto culminante D5 aparece 2 vezes  [ponto_culminante]

0 erro(s), 3 aviso(s), 0 info — aprovado
```

Veja a mesma curva de rigidez em ação num exercício com erros:

```
python -m verificador exercicios/exemplos/nivel02-com-erros.txt -n 2    # reprovado: 5 erros
python -m verificador exercicios/exemplos/nivel02-com-erros.txt -n 8    # 1 erro, o resto é aviso
python -m verificador exercicios/exemplos/nivel02-com-erros.txt -n 10   # aprovado, 3 infos
```

Outras opções:

| comando | o que faz |
|---------|-----------|
| `--tabela` | mostra quanto cada regra vale em cada nível |
| `--regras -n 4` | explica as regras ativas no nível 4 |
| `--tom "a menor"` | define a tonalidade (necessária para as regras de sensível e cadência) |
| `--cf baixo` | indica qual voz é o cantus firmus |
| `--externas` | reduz uma partitura de piano às vozes externas (automático do nível 8 em diante) |

O programa sai com código 1 quando há erros, então dá para usar em scripts.

## Formatos de entrada

**Texto (`.txt`)**, rápido de escrever à mão. Uma voz por linha, da mais aguda para a mais grave:

```
titulo: meu exercício
compasso: 2/2
tom: D dorico
cf: cantus

contraponto: P/2 D5/2  C5 A4  G4 C5 ...
cantus:      D4/4      F4     E4    ...
```

- Cada nota é `ALTURA/DURAÇÃO`, com a duração em semínimas (`4` = semibreve, `2` = mínima, `1` = semínima, `0.5` = colcheia). Sem duração, a nota repete a duração anterior.
- Alturas em notação inglesa com oitava: `C4` é o dó central. Sustenido `#`, bemol `b` ou `-` (`Bb3`, `E-4`).
- `~` no fim liga a nota à seguinte; `P` é pausa.
- Tonalidades: `C maior`, `a menor`, `D dorico`, `E frigio`, `G mixolidio`...
- `#` depois de um espaço começa um comentário.

**Partituras**: MusicXML (`.musicxml`, `.mxl`), MIDI, ABC e tudo o que o music21 lê.
Escreva no MuseScore, exporte em MusicXML e verifique. Cada parte (ou voz dentro de uma
parte) vira uma voz; com acordes, o verificador passa a comparar só as vozes externas.

## Organização sugerida para o seu trabalho

```
meus-exercicios/
  nivel-01/
    001-cf1-acima.txt
    002-cf1-abaixo.txt
  nivel-02/
  ...
```

## Estrutura do código

| arquivo | o que tem |
|---------|-----------|
| `verificador/niveis.py` | **a curva de rigidez**: a tabela de regra × nível. Edite aqui para mudar o currículo. |
| `verificador/regras.py` | as regras. Cada uma só detecta; a gravidade vem da tabela. |
| `verificador/analise.py` | intervalos, momentos verticais, classificação das dissonâncias (passagem, retardo…) |
| `verificador/leitura.py` | leitura do formato de texto e de partituras |
| `tests/` | testes (`python -m pytest`) |

## Limites

O verificador trabalha com intervalos e movimento; ele não faz análise harmônica (não sabe
que acorde é cada vertical). Por isso regras como "não omitir a 3ª" ou "dobrar a
fundamental" ficam por sua conta; cada página do currículo lista o que o programa não
verifica. E nenhum programa diz se a música é boa. Toque, cante, escute.
