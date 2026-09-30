# Aulas no estilo Duolingo: o que a pesquisa diz

Resumo da pesquisa feita para desenhar as aulas da versão 2. **Limitação:** o acesso direto às
páginas foi bloqueado pelo proxy; tudo vem de resultados e trechos de busca (cerca de 30
consultas). Números do Duolingo sobre streak, XP e energia vêm de terceiros e não foram
confirmados em fonte primária.

## 1. Como o Duolingo organiza o aprendizado

- **Trilha linear** (substituiu a "árvore"): o aluno não precisa decidir o que fazer; a revisão
  espaçada está embutida no caminho.
- **Seções → unidades → níveis → lições.** Unidades pequenas e temáticas, cada uma com um
  "Guidebook" de explicações. Lições de poucos minutos (terceiros: 2–10 min, ~17 questões).
- **Aprender fazendo:** a sessão começa com exercícios, não com aula; explicações curtas aparecem
  depois de erros. Primeiro reconhecer, depois produzir.
- **Revisão:** círculos de prática personalizada na trilha; "Mistakes" guarda cada erro para
  voltar depois; "Legendary" é um desafio sem dicas.
- **Motor adaptativo:** Half-Life Regression (Settles & Meeder, ACL 2016) estima a "meia-vida" de
  cada item na memória: +16% de revocação e +12% de engajamento diário. Birdbrain estima ao mesmo
  tempo a habilidade do aluno e a dificuldade do item (tipo Elo) para montar lições no "ponto
  Cachinhos Dourados".
- **Corações → Energia:** o próprio Duolingo disse que tirar vida por erro não ajudava a aprender
  (iniciantes tinham 2× mais chance de ficar sem corações no meio da lição).
- **Críticas:** gamificação que vira fim em si (arXiv 2203.16175), "XP grinding", ansiedade de
  streak, lições fáceis demais que dão ilusão de domínio.

## 2. Princípios de aprendizagem e como aplicar

| Princípio | Evidência | No app |
|---|---|---|
| Prática de recuperação | Roediger & Karpicke 2006: 56% vs 42% de retenção após 1 semana; Dunlosky et al. 2013: alta utilidade | Cada conceito é seguido de uma pergunta; nada de telas só de leitura em sequência |
| Prática espaçada | Cepeda et al. 2008: intervalo ideal ≈ 10–20% do tempo de retenção desejado | Fila de revisão com intervalos crescentes em localStorage |
| Intercalação | Rohrer & Taylor 2007: 77% vs 38% no dia seguinte, ganho em discriminação | Misturar tipos de erro (5ªs paralelas, ocultas, movimento correto) nas revisões |
| Exemplo resolvido + esvanecimento | Sweller; cuidado com o *expertise reversal* | Exemplo completo → mesmo exemplo com lacunas → só o cantus firmus; deixar pular |
| Feedback imediato e explicativo | Butler & Roediger 2008 | Mostrar sempre a resposta certa e um "porquê" de uma linha, com a pauta destacada |
| Domínio (mastery) | Bloom; meta-análises ≈ 0,5 DP | Liberar a composição da unidade com ≥ 80% nas lições; oferecer reforço |
| Geração / dificuldade desejável | *Make It Stick* | Pergunta-gancho antes do conceito ("qual soa mais final?") sem custo |
| Calibração | *Make It Stick* | Resumo com o que foi errado, não "Perfeito!" genérico |
| Autoexplicação | Dunlosky: utilidade moderada | Às vezes perguntar "por que está certo?" |

## 3. Tipos de exercício bons para o celular

1. Identificar nota na pauta · 2. Colocar a nota certa (tocando) · 3. Identificar intervalo escrito ·
4. Identificar intervalo pelo ouvido · 5. Grau da escala em contexto · 6. Tipo de cadência pelo ouvido ·
7. Qual dos dois trechos tem paralelas · 8. Ache e toque no erro · 9. Corrija o erro (setas ▲▼) ·
10. Complete a nota que falta · 11. Classifique a consonância · 12. Classifique o movimento ·
13. Verdadeiro/falso com justificativa · 14. Associe pares · 15. Ordene os acordes ·
16. Escolha a melhor continuação melódica.

Evitar microfone/detecção de altura nesta fase; preferir toque e setas a arrastar.

## 4. Modelo de lição recomendado (3–5 min, 6–10 telas)

1. Pergunta-gancho (opcional, sem custo).
2. Cartão de conceito: ≤ 40 palavras, 1 regra, 1 pauta, botão ▶.
3. Exemplo resolvido com áudio, revelado por toques.
4. Prática: 4–6 itens, do reconhecimento à produção guiada, com 1–2 itens de revisão misturados.
5. Resumo: a regra em uma linha, placar e o que foi errado.

**Sem punição:** sem vidas; o item errado volta no fim da lição e entra na revisão; dicas
graduais; se errar 2 seguidas, o próximo item é mais fácil.

**Revisão espaçada (Leitner simplificado):** caixas de 0, 1, 3, 7, 16, 35 dias; acerto sem dica
sobe uma caixa, com dica mantém, erro volta para a 1. Guardar o *conceito*, não a pergunta, e
gerar uma pergunta nova a cada revisão. "Revisão do dia" com 5–8 itens vencidos, misturados.

**Liberar a composição:** todas as lições da unidade feitas com ≥ 80%; no exercício, cada erro
aponta para a lição que o ensina e volta para a fila de revisão.

## 5. Armadilhas

- Gamificação demais: dar XP por domínio e revisão, não por repetir o fácil.
- Texto demais no celular: uma ideia por tela.
- **Áudio no iOS:** o `AudioContext` só começa dentro de um toque; a chave de silencioso do iPhone
  emudece o Web Audio (usar `navigator.audioSession.type = "playback"` quando existir e avisar
  "sem som? veja o modo silencioso"); nunca tocar sozinho.
- **localStorage no Safari** pode ser apagado depois de 7 dias sem uso (exceto na Tela de Início):
  oferecer exportar/importar o progresso.
- Múltipla escolha sem feedback fixa o erro; blocos de um tipo só enganam; exemplos resolvidos
  atrapalham quem já sabe.

## Fontes (consultadas via busca)

- Duolingo: blog.duolingo.com (new-duolingo-home-screen-design, how-to-review-lessons-on-duolingo,
  guide-to-duolingo-practice-hub, duolingo-energy, duolingo-teaching-method, what-is-implicit-learning,
  how-duolingo-streak-builds-habit); whitepaper *The Duolingo Method* (2023);
  research.duolingo.com/papers/settles.acl16.pdf; github.com/duolingo/halflife-regression;
  spectrum.ieee.org/duolingo.
- Críticas e terceiros: duoplanet.com/duolingo-learning-path; duolingo.fandom.com; arxiv.org/pdf/2203.16175;
  thedecisionlab.com (streak creep); classcentral.com (hearts → energy).
- Aprendizagem: Roediger & Karpicke 2006 (Psychological Science); Dunlosky et al. 2013 (PubMed 26173288);
  Cepeda et al. 2008; Rohrer & Taylor 2007/2010; Butler & Roediger 2008; Hattie & Timperley 2007;
  nintil.com/bloom-sigma; resumo de *Make It Stick*.
- Apps: musictheory.net/exercises, Tenuto, tonedear.com, Functional Ear Trainer, EarMaster,
  ars-nova.com (Counterpointer), hooktheory.com (Chord Crush), Tonic.
- Técnico: github.com/feross/unmute-ios-audio; bugs.webkit.org/show_bug.cgi?id=237322;
  webkit.org/tracking-prevention.
