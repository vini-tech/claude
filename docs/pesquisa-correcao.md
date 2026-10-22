# O que torna a música interessante, e como a correção pode medir isso

Pesquisa do melhorador (out/2026) sobre melodia, harmonia, ritmo e forma, cruzada com o que o
verificador já faz (`web/motor.js`, `web/regras2.js`, `web/regras3.js`, `web/estilo.js`).

Legenda: **[fonte]** número lido na fonte; **[medi]** medido com music21 nos 371 corais de Bach;
**[palpite]** limiar sem fonte (calibrar com as soluções do livro antes de usar).

## 1. O que a pesquisa diz

### Melodia
- **Proximidade:** no corpus Essen mais da metade dos intervalos tem até 2 semitons; âmbito médio
  13,6 st (Temperley, ISMIR 2006) [fonte].
- **Tendências de Huron** (*Sweet Anticipation*, 2006): proximidade, grau descendente mais comum que
  ascendente, regressão ao centro do registro, arco na frase. São tendências, não proibições.
- **Salto e volta:** von Hippel & Huron (2000) mostram que a volta depois do salto é em boa parte
  **regressão à média**: o salto leva ao extremo do registro e a linha volta ao centro. O ouvinte
  espera a volta de qualquer jeito. Compensar o salto continua regra do contraponto, mas a explicação
  ao aluno fica melhor quando diz por quê (o salto foi ao extremo e a linha não voltou).
- **Arco:** Huron (1996), 9 contornos por frase (início × média do meio × fim); o convexo é o mais
  comum.
- **Inércia de grau** depende do estilo (Chiu & Temperley 2024: forte no folk, quase nula no pop):
  não vira regra.
- **Repetição:** Schoenberg (motivo = traço repetido; repetição dá coerência, variação evita
  monotonia); Margulis (2013): inserir repetições em música atonal aumentou agrado e interesse.

### Harmonia
- **Assimetria das fundamentais em Bach** (Tymoczko 2003, 5240 progressões): 5ª↓ 35 %, 2ª↑ 26 %,
  3ª↓ 13 %; progressões "dominantes" ≈ 74 % [fonte]. Em Beethoven ≈ 42 % (Moss et al. 2019) e no
  rock é simétrico (de Clercq & Temperley 2011): é marca de estilo.
- **Transições em Bach:** V→I 67 %, V→IV 4 % [fonte]. Retrogressão é rara, não inexistente.
- **Soprano–baixo em Bach** [medi]: nos tempos, contrário 43 %, oblíquo 26 %, direto 27 %,
  paralelo 5 %; 5ª/8ª paralelas 0,03–0,09 %; 5ª/8ª diretas 6–9 % (por isso só a com salto no
  soprano é problema).
- **Ritmo harmônico:** aceleração na continuação e antes da cadência (Caplin); acorde do tempo fraco
  mantido no forte enfraquece a métrica (pedagogia; não confirmado em Kostka/Aldwell).
- **Tensão:** Lerdahl (*Tonal Pitch Space*), Herremans & Chew 2016 (tensile strain na espiral);
  Bigand & Parncutt 1999: o ouvinte segue a tensão de cadência a cadência, não a da peça toda.
- **Surpresa:** Cheung et al. 2019: prazer alto com acorde **surpreendente em contexto previsível**
  (ou previsível em contexto incerto). Superfície em sela, não um U simples.
- **Força das cadências:** PAC > IAC > HC > DC (Caplin; Sears, Caplin & McAdams 2014).

### Ritmo e métrica
- **GTTM:** notas longas e ataques preferem tempos fortes (MPR3, MPR5a).
- **Síncope:** Longuet-Higgins & Lee (versão de Fitch & Rosenfeld 2007) e WNBD (Gómez et al. 2005);
  síncope alta faz o ouvinte perder o pulso. O "U invertido" de Witek 2014 é frágil (reanálise PLOS
  ONE 2024): não usar como nota.
- **Variedade:** nPVI de durações (Patel & Daniele 2003): temas instrumentais ingleses 46,9,
  franceses 40,9 [fonte]; 0 = ritmo uniforme.
- **Ritmo complementar:** nas Invenções de Bach há menos ataques simultâneos que o acaso preveria
  (Huron 1993): é o que separa as vozes.

### Forma e interesse
- **Sentença (Caplin):** apresentação = ideia básica + repetição (exata, ou na dominante);
  continuação = fragmentação, aceleração (harmônica e de superfície) e liquidação; termina em cadência.
- **Período:** consequente com cadência mais forte que o antecedente.
- **Hipermetro** (Rothstein): frases de 4 compassos; expansões são desvios marcados.
- **Interesse em geral:** Berlyne e Gold et al. 2019 (complexidade intermediária); Meyer e Huron
  (expectativa atrasada ou frustrada). Os ótimos variam com o corpus: **medir em relação às soluções
  do próprio livro**, nunca como nota absoluta. Cuidado com Goodhart: o que o app premia, o aluno
  otimiza.

### Corretores que já existem
Counterpointer, HarmonyBuilder (Pro sugere o próximo acorde sem erro), Musition, Harmonia (corrige
também a análise do aluno), music21.voiceLeading. **Nenhum mede ritmo, forma ou interesse**: é o
espaço livre do ateliê. Komosinski & Szachewicz: mostrar contagens por critério, não somar pesos.

## 2. O que o verificador já faz e o que falta

Já cobre bem: espécies, paralelas, dissonância, linha do cantus, cifras, regra da oitava, 6/4,
retrogressão, cadências do plano, modulação, esquemas, esqueleto, sequência do motivo, e um relatório
de estilo com graus/saltos, clímax, âmbito, consonâncias e movimento.

Lacunas encontradas:

| # | lacuna | onde | evidência |
|---|---|---|---|
| L1 | 7ª do acorde não é obrigada a descer | `regras3.js` | só `dissonancia_resolucao` olha intervalos; V43 com a 7ª no soprano forma 3ª com o baixo e passa |
| L2 | sensível não entra nos perfis tonais | `temas.js` `TONAL` | `sensivel_resolve` e `sensivel_dobrada` existem no motor, mas não no perfil |
| L3 | +6 e N6 sem regra de resolução | `regras3.js` | só a grafia é conferida (`cifras_coerentes`) |
| L4 | cadência pode cair em tempo fraco | `cadencias_do_plano` | não olha a força métrica do I final |
| L5 | acorde mantido do tempo fraco para o forte | — | nenhuma regra |
| L6 | a sentença não confere a repetição da ideia básica | `nivel3.js` `sen1–3` | perfil só `MELODIA`; `ideia_repetida` compara alturas exatas (falha na repetição na dominante) |
| L7 | ritmo quase não é corrigido nem descrito | `estilo.js` | só `ritmo_da_especie`; nada de variedade, densidade, complementaridade |
| L8 | relatório não fala de harmonia, forma nem motivo | `estilo.js` | só melodia e relação entre vozes |
| L9 | referências do relatório sem número de corpus | `estilo.js` | "o contrário costuma ser o mais frequente" (Bach: 43 % nos tempos) |

## 3. Propostas para o programador (em ordem)

### A. Regras novas (erro/aviso, ligadas por perfil)
1. `setima_resolve` (L1): o membro 7 da cifra, numa voz externa, desce por grau no acorde seguinte
   (permitido ficar no mesmo acorde, ou subir em 5–6 de passagem no baixo). Erro nos perfis tonais.
2. Perfil `TONAL` com `sensivel_resolve` (soprano, sensível do tom local, inclusive secundárias) e
   `sensivel_dobrada` (L2). Rodar o validador: pode reprovar soluções existentes.
3. `aumentada_resolve` e `napolitana_resolve` (L3): ♯4 sobe e ♭6 desce para 5̂ (expansão à 8ª);
   na N6, ♭2 desce (para 7̂ ou via 1̂).
4. `cadencia_tempo_forte` (L4): o I (e o V da semicadência) cai em tempo forte. Aviso.
5. `harmonia_sincopada` (L5): mesma cifra do tempo fraco para o forte seguinte; exceções: pedal,
   6/4 cadencial. Aviso.
6. `apresentacao_repetida` (L6): na sentença, c. 3–4 repetem os c. 1–2 por ritmo (≥ 75 % dos ataques
   iguais) e por desenho de intervalos (diatônicos, aceitando transposição). Mesma tolerância à
   transposição em `ideia_repetida`. Erro nos exercícios de sentença.
7. `variedade_ritmica` (L7) só nos temas do nível 3: aviso se houver 1–2 valores de duração em 8
   compassos ou nPVI < 10 [palpite]. Desligada nas espécies.

### B. Relatório de estilo (descritivo, não reprova; `estilo.js`)
1. **Ritmo:** nPVI e nº de valores; curva de densidade de ataques por compasso (mostra aceleração e
   fragmentação na continuação); complementaridade entre vozes = ataques simultâneos observados ÷
   esperados (p₁·p₂), < 1 = vozes independentes (5ª espécie e piano).
2. **Harmonia (com cifras):** % de fundamentais "dominantes" (5ª↓, 3ª↓, 2ª↑) com Bach ≈ 74 % de
   referência; nº de acordes distintos; classificação de cada cadência (PAC/IAC/HC/DC) e a ordem de
   força ao longo da peça; ritmo harmônico por compasso.
3. **Melodia:** contorno de Huron por frase (convexo, descendente…); nota extrema seguida de mais
   afastamento ("o salto foi ao extremo e não voltou").
4. **Forma/motivo:** matriz de semelhança por compasso (ritmo + intervalos) resumida em
   "repete / varia / novo"; similaridade com o motivo inicial caindo perto da cadência = liquidação.
5. **Referências calibradas:** um script (ao lado de `validar_temas.js`) calcula essas métricas em
   todas as soluções do livro e grava as faixas (percentis 10–90) por tipo de capítulo; o relatório
   compara o aluno com elas. Atualizar a referência do movimento (Bach: contrário 43 % nos tempos).

### C. Explicações
- Na mensagem de `salto_nao_compensado`, quando o salto termina no extremo do âmbito, dizer que o
  ouvido espera a volta ao centro (regressão; von Hippel & Huron 2000).
- Quando uma métrica do relatório marcar atenção, apontar o compasso (como os erros já fazem).

### Não fazer
- Nota única de "interesse", ou o U invertido como limiar de reprovação (achados de grupo, frágeis).
- Inércia de grau, assimetria de fundamentais ou síncope como regra (dependem do estilo).
- IDyOM/n-gramas de surpresa por enquanto: corpus do livro pequeno; voltar a isso depois do item B5.

## Fontes principais
- Temperley 2006: https://ismir2006.ismir.net/PAPERS/ISMIR0630_Paper.pdf
- von Hippel & Huron 2000: https://online.ucpress.edu/mp/article-abstract/18/1/59/62088/
- Resenha de *Sweet Anticipation*: https://www.marcus-pearce.com/assets/papers/huron06-review.pdf
- Chiu & Temperley 2024: https://doaj.org/article/43b320953f444935a677d6cec2cb74f8
- Margulis 2013: https://journals.sagepub.com/doi/10.2190/EM.31.1.c
- Tymoczko, gramática tonal: https://dmitri.mycpanel.princeton.edu/files/publications/tonaltheories.pdf
- Moss et al. 2019: https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0217242
- de Clercq & Temperley 2011: https://rockcorpus.midside.com/2011_paper/declercq_temperley_2011.pdf
- Cheung et al. 2019: https://cms.mus.cam.ac.uk/publications/cheung-uncertainty-surprise/
- Herremans & Chew 2016: https://dorienherremans.com/sites/default/files/paper_tenor_dh_preprint_small.pdf
- Sears, Caplin & McAdams 2014: https://escholarship.mcgill.ca/downloads/6m311t34v
- Fitch & Rosenfeld 2007: https://web.uvic.ca/~aschloss/course_mat/MUS%20511/ARTICLES%20AND%20REFS%20FOR%20320/FitchRosenfeld20071.pdf
- Gómez et al. 2005 (WNBD): https://archive.bridgesmathart.org/2005/bridges2005-73.pdf
- Witek 2014 e reanálise 2024: https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0094446 ; https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0311877
- Patel & Daniele 2003: https://labs.la.utexas.edu/gilden/files/2016/04/Patel_Daniele_Cognition.pdf
- Huron 1993 (assincronia em Bach): https://sonicfield.org/library/note-onset-asynchrony-in-j-s-bachs-two-part-inventions
- Yang & Lerch / mgeval: https://github.com/RichardYang40148/mgeval ; MusPy: https://muspy.readthedocs.io/en/stable/metrics.html
- Gold et al. 2019: https://www.jneurosci.org/content/39/47/9397
- Komosinski & Szachewicz: http://www.cs.put.poznan.pl/mkomosinski/research/counterpoint-composition-dominance-relation.pdf
- HarmonyBuilder: https://www.harmonybuilder.com/manuals/manual_educational_english.html
