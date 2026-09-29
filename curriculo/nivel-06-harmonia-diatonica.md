# Nível 6 — Harmonia a 4 vozes, diatônica (coral)

Mudança de mundo: sai o contraponto modal, entra a harmonia tonal. Soprano, contralto,
tenor e baixo, em acordes. As regras de condução de vozes do contraponto continuam
(é daí que elas vêm), mas a melodia de cada voz fica mais livre, e surgem regras novas
sobre acordes.

## O que muda

- **Afrouxa:** saltos de 6ª, saltos seguidos e salto sem compensação viram aviso. As vozes internas às vezes precisam saltar.
- **Afrouxa:** as regras de começo e fim do contraponto (consonância perfeita, cadência 6–8) saem. Entra a cadência tonal. *(aviso)* `cadencia_autentica`
- **Afrouxa:** quintas e oitavas ocultas só contam entre as vozes externas e quando o soprano chega por salto.
- **Afrouxa:** uníssono entre vozes vizinhas é permitido.
- **Fica mais rígido:** sobreposição e espaçamento viram erro; extensão de cada voz passa a ser verificada. `extensao_da_voz`

## Regras

- **Extensões:** soprano C4–G5, contralto G3–D5, tenor C3–G4, baixo E2–C4. Nomeie as vozes assim no arquivo para ativar a verificação.
- **Espaçamento:** no máximo uma 8ª entre soprano e contralto e entre contralto e tenor. Entre tenor e baixo pode ser mais. `espacamento`
- **Sensível:** nunca dobrada; no soprano, resolve na tônica. `sensivel_dobrada` `sensivel_resolve` (precisam de `tom:` no arquivo)
- **Sétima do acorde:** chega por grau ou preparada, e resolve por grau descendente. `dissonancia_aproximacao` `dissonancia_resolucao`
- **4ª contra o baixo** (acorde de 6/4): trate como dissonância: 6/4 cadencial, de passagem ou de bordadura, e resolva por grau.
- Paralelas, cruzamentos, intervalos aumentados: tudo erro, como antes.

**Não verificado, mas obrigatório:**
- Dobre a fundamental em estado fundamental; em 1ª inversão, dobre o que soar melhor (evitando a sensível).
- Não omita a 3ª do acorde.
- Notas comuns entre acordes ficam na mesma voz; as outras vão para a nota mais próxima.
- Funções: T (I, vi), S (IV, ii), D (V, vii°). Progressões normais: T → S → D → T.

## Exercícios

1. Harmonize **baixos dados** (baixo cifrado) com tríades em estado fundamental e 1ª inversão.
2. Harmonize **melodias de soprano dadas**: escolha primeiro o baixo e as funções, depois preencha.
3. Cadências: autêntica perfeita, imperfeita, plagal, à dominante, deceptiva (V–vi). Todas em pelo menos 4 tonalidades maiores e 4 menores.
4. 6/4 cadencial, 6/4 de passagem, V7 e suas inversões.
5. Uma frase de 8 compassos sua, a 4 vozes, terminando em cadência autêntica.

Exemplo: [`nivel06-coral-do-maior.txt`](../exercicios/exemplos/nivel06-coral-do-maior.txt).

## Ouvir e analisar

- Bach, corais (a edição Riemenschneider dos *371 Corais*). Analise um por semana: funções, cadências, e cada ponto em que Bach "quebra" uma regra deste nível.

## Para avançar

20 exercícios sem erros, em tonalidades maiores e menores.

**Leitura:** Schoenberg, *Harmonia* (primeiros capítulos); Koellreutter, *Harmonia funcional*; Aldwell & Schachter, partes 1–3.
