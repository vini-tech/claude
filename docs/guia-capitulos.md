# Guia para escrever capítulos do ateliê

O ateliê (`web/curso.html`) é um livro de composição em capítulos ("temas"). Cada capítulo ensina **um
assunto de composição** para um leitor que já sabe teoria básica: primeiro **a regra histórica, como
os tratados ensinavam** (a maneira "certa"), depois **como os compositores a quebraram** e o que a
quebra produz. O nível de detalhe é o de um bom livro de harmonia (Aldwell & Schachter, Piston,
Schoenberg), mas em formato dinâmico: texto curto e técnico, exemplos tocáveis em camadas, contraste,
perguntas, e exercícios corrigidos automaticamente.

## Onde escrever

Cada autor escreve **só no seu módulo** `web/livro/<nome>.js`. Não edite outros arquivos (temas.js,
regras, página, testes): se precisar de algo, diga no relatório final. Modelo de módulo:

```js
/* Nível 2 · Cadências e função harmônica. Fontes: … */
(function (raiz) {
  "use strict";
  const T = raiz.TEMAS || require("../temas.js").TEMAS;
  const M = raiz.Motor || require("../motor.js");
  const { TONAL, MELODIA, N1, N2, N3, N4, CANTUS, PLANO_CP, PLANO_BAIXO, PLANO_FRASE, FUX, CF1, CF2 } = T.perfis;

  T.inserir(2, { id: "cadencias", titulo: "…", /* … */ }, { depoisDe: "oitava" });
})(this);
```

O nome do módulo precisa estar em `web/livro/indice.js` (o coordenador acrescenta; para testar,
acrescente localmente e avise). Regras novas específicas do capítulo podem ser definidas no próprio
módulo com `M.definirRegra(id, titulo, explicacao, function* (ex, ctx) { yield [compasso, mensagem, notas] }, { precisaTom, porque, corrigir })`
— use um prefixo no id (ex.: `inv_`), e lembre que o verificador usa `M.verificarPerfil(ex, perfil, ctx)`.

## Formato de um capítulo

Veja capítulos prontos em `web/temas.js` como modelo (os melhores: `oitava`, `retardos`, `superficie`,
`modos`). Campos:

```js
{
  id: "cadencias", titulo: "Cadências",
  antes: [ { p: "pergunta", o: ["CERTA (sempre a primeira)", "errada", "errada", "errada"], e: "explicação" }, … ], // 3 perguntas
  objetivo: "uma frase: o que o leitor vai conseguir compor",
  ouvir: ["obra real e famosa — compasso só se tiver certeza", …],
  esboco: "tarefa curta para tentar ANTES da aula, sem correção",
  secoes: [
    { tipo: "texto", rotulo: "A regra", titulo: "…", html: `<p>…</p><ul>…</ul><table class="tabela-modos">…</table>` },
    { tipo: "exemplo", titulo: "…", intro: "…", camadas: [
        { titulo: "…", partitura: "tom: C maior\nsoprano: …\nbaixo: …", rotulos: ["soprano", "baixo"],
          cifras: [[0, "I"], [1, "V43"], …],          // [tempo em semínimas desde o início, cifra] — uma por nota do baixo
          anotacoes: [[voz, índiceDaNota, "texto"]],   // rótulos embaixo de notas (índice conta notas, não pausas; notas ligadas são UMA nota)
          notas: [["decisao", "…"], ["rejeitada", "alternativa que considerei e por que não"], ["checagem", "…"]],
          pausa: ["pergunta aberta", "comentário revelado depois"] }, … ] },
    { tipo: "contraste", titulo: "…", a: { rotulo, partitura, cifras }, b: { … }, pergunta: "…", comentario: "<p>…</p>" },
    { tipo: "quebra", titulo: "…", html: `<p>quem quebrou, onde, e o que isso produz</p>`,
      exemplos: [ { rotulo: "…", partitura: "…", cifras: […], perfil: { …perfil com a regra quebrada em "info" ou ausente… }, comentario: "…" } ] },
  ],
  exercicios: [ … 3 a 5 … ],
}
```

### Exercícios

```js
{ id: "cad1", titulo: "…", modo: "completar" | "menos apoio" | "restrição" | "livre" | "quebrar",
  perfil: { ...TONAL, notas_do_acorde: "erro" },   // ou ...N1 / ...N2 / ...N3 / ...N4 para contraponto de espécies
  nivel: 6, contexto: { nivel: 6, plano: { cadencia: 4, semicadencia: 2 }, … },
  cifras: ["I", "V6", …]          // cifras fixas (uma por nota do baixo), OU
  cifrasAluno: true, cifrasIniciais: "I V6 I",   // o aluno escreve as cifras (campo de texto)
  instrucoes: "<p>…</p>",
  texto: "tom: C maior\ncf: baixo\nsoprano:\nbaixo: C3/1 …",  // a voz em cf: é dada (travada); a outra o aluno escreve
  duracao: 1,                      // duração inicial do piano em semínimas
  alvoCompassos: 4,                // tamanho do exercício (sem ele, vale o do cantus/cf)
  solucao: "texto completo",       // OBRIGATÓRIA (exceto sortear: true em contraponto de espécies)
  solucaoCifras: "I V6 …",         // quando cifrasAluno
  comentarioSolucao: "…" }
```

Sequência recomendada (adaptativa): 1 **completar** (falta justamente a decisão do capítulo) → 2 **menos
apoio** → 3 **restrição** (com regra de restrição) → 4 **livre** → 5 **quebrar** (o perfil deixa a regra
quebrada como "info" e as instruções pedem a quebra num ponto exato, com a razão; a solução mostra como).

## Formato de texto das partituras

```
compasso: 4/4          (padrão 4/4; 2/2 para espécies)
tom: C maior           (C maior, A menor, D dorico, E frigio, G mixolidio, A eolio, Eb maior, f# menor…)
cf: baixo              (a voz dada)
soprano: E5/1 D5 C5/2  (nota/duração em semínimas; a duração vale até mudar; P = pausa; ~ liga: C5/2~ C5)
baixo: C3/2 G2 C3/4
```
C4 = dó central. Vozes: a primeira linha é a de cima. O verificador trabalha com **duas vozes** (par
externo soprano–baixo, ou contraponto contra cantus firmus) ou uma voz (cantus firmus). **Não há coral a
quatro vozes**: ensine harmonia como o par externo + cifras (as vozes internas ficam implícitas, como no
baixo cifrado) e diga isso quando for relevante.

## Cifras (uma por nota do baixo)

- Graus com qualidade pela caixa: `I ii iii IV V vi vii°`; figuras `6 64 7 65 43 42 9`: `I6 ii65 V43 vii°7 viiø7 IV7 V9 I64`.
- Empréstimo e alterações: `iv bVI bIII bVII ii°6 iiø65 #iv°7` (b/# altera a fundamental).
- Secundárias: `V/V V7/IV V65/ii vii°7/V viiø43/V`.
- Napolitana `N6` (ou `N`); sextas aumentadas `It6 Fr43 Ger65` (6º grau abaixado no baixo).
- Troca de tom: `G:ii6` (a partir daí sol maior; minúscula = menor: `e:iv`). Pivô: `vi=G:ii`
  (duas leituras do mesmo acorde; enarmonia permitida: `vii°7=e:vii°7` com grafias diferentes).
- Em menor, o V e o vii° já usam a sensível.

## Regras disponíveis (ids para os perfis)

Use `erro` para o que o exercício exige, `aviso` para o desaconselhado, `info` para o permitido.
Restrições de exercício usam campos do `contexto` (indicados na explicação).

- `ritmo_da_especie` — Ritmo da espécie: Na 1ª espécie, nota contra nota; na 2ª, duas notas por nota do cantus firmus; na 3ª, quatro; na 4ª, síncopes (notas ligadas por cima da barra).
- `dissonancia_proibida` — Só consonâncias: Na 1ª espécie todo intervalo contra o baixo deve ser consonante: uníssono, 3ª, 5ª, 6ª ou 8ª (a 4ª justa conta como dissonância).
- `dissonancia_tempo_forte` — Tempo forte consonante: O tempo forte de cada compasso deve ser consonante. A única dissonância aceita no tempo forte é o retardo (nota preparada e sustentada).
- `retardo_nao_permitido` — Sem retardos nesta espécie: Na 2ª e na 3ª espécie o contraponto não sustenta notas por cima do tempo forte, então não há retardos.
- `dissonancia_aproximacao` — Dissonância chega por grau: Uma nota dissonante deve chegar por grau conjunto (ou ser preparada pela mesma nota). Chegar a ela por salto é uma apojatura, que só entra no estilo livre.
- `dissonancia_resolucao` — Dissonância sai por grau: Uma nota dissonante deve seguir por grau conjunto. A partir da 3ª espécie a nota cambiata (desce por grau, salta uma 3ª para baixo e sobe por grau) e a bordadur
- `bordadura_na_2a_especie` — Só notas de passagem na 2ª espécie: No contraponto estrito de 2ª espécie a dissonância é sempre nota de passagem: continua na mesma direção em que chegou. A bordadura fica para a 3ª espécie.
- `retardo_resolve_descendo` — Retardo resolve descendo: A nota sustentada que vira dissonância no tempo forte (retardo) deve resolver descendo por grau conjunto.
- `quintas_paralelas` — Quintas paralelas: Duas vozes não podem ir de uma 5ª justa para outra 5ª justa (nem por movimento contrário).
- `oitavas_paralelas` — Oitavas e uníssonos paralelos: Duas vozes não podem ir de uma 8ª (ou uníssono) para outra 8ª (ou uníssono).
- `quintas_oitavas_ocultas` — Quintas e oitavas diretas (ocultas): Não se chega a uma 5ª ou 8ª justa por movimento direto. No contraponto a duas vozes (níveis 1–5) vale sempre; a partir da harmonia, só entre as vozes externas e
- `quintas_tempo_forte` — Quintas/oitavas em tempos fortes seguidos: Na 2ª e 3ª espécie, 5ªs ou 8ªs em tempos fortes consecutivos soam como paralelas disfarçadas.
- `paralelas_imperfeitas_excessivas` — Terças ou sextas paralelas demais: Mais de três 3ªs (ou 6ªs) paralelas seguidas tiram a independência das vozes.
- `unissono_interno` — Uníssono no meio do exercício: No contraponto estrito o uníssono só aparece no começo e no fim.
- `cruzamento_de_vozes` — Cruzamento de vozes: Uma voz não passa abaixo da voz que está embaixo dela (nem acima da que está em cima).
- `sobreposicao_de_vozes` — Sobreposição de vozes: Uma voz não deve ir além da nota que a voz vizinha acabou de tocar.
- `espacamento` — Espaçamento entre vozes: A duas vozes, no máximo uma 10ª entre elas. A três ou mais, vozes superiores vizinhas ficam a no máximo uma 8ª (entre tenor e baixo pode ser mais).
- `extensao_da_voz` — Extensão das vozes do coral: Soprano C4–G5, contralto G3–D5, tenor C3–G4, baixo E2–C4. Só vale para vozes com esses nomes.
- `salto_maior_que_oitava` — Salto maior que uma 8ª: Nenhuma voz salta mais que uma oitava.
- `intervalo_melodico_aumentado_diminuto` — Intervalo melódico aumentado ou diminuto: A melodia evita intervalos aumentados e diminutos (trítono, 2ª aumentada, 4ª diminuta…) e cromatismos.
- `salto_de_sexta_ou_setima` — Salto de 6ª ou 7ª: No estilo estrito não se salta 7ª nem 6ª maior; a 6ª menor só ascendente.
- `salto_nao_compensado` — Salto grande sem compensação: Depois de um salto maior que uma 4ª justa, a melodia muda de direção.
- `saltos_consecutivos` — Saltos seguidos na mesma direção: Dois saltos na mesma direção só se somarem no máximo uma 8ª (arpejo de acorde); três nunca.
- `nota_repetida` — Nota repetida: No contraponto estrito a mesma nota não é atacada duas vezes seguidas.
- `ponto_culminante` — Ponto culminante único: A nota mais aguda da melodia aparece uma vez só.
- `ambito_melodico` — Âmbito da melodia: Cada voz do contraponto cabe numa 10ª.
- `inicio_perfeito` — Começo em consonância perfeita: O primeiro intervalo é uníssono, 5ª ou 8ª. Se o contraponto está abaixo do cantus firmus, só uníssono ou 8ª.
- `final_perfeito` — Final em uníssono ou 8ª: O último intervalo entre as vozes externas é uníssono ou 8ª.
- `cadencia_contraponto` — Cadência do contraponto: No fim, as vozes externas chegam ao uníssono/8ª por grau e em movimento contrário, vindas de uma 6ª maior ou 3ª menor (a sensível sobe meio tom).
- `sensivel_resolve` — Sensível resolve na tônica: Na voz superior, a sensível vai para a tônica quando o baixo chega à tônica.
- `sensivel_dobrada` — Sensível dobrada: A sensível nunca é dobrada.
- `cadencia_autentica` — Termina em cadência: O baixo termina na tônica, vindo da dominante (ou da subdominante, cadência plagal).
- `cf_final` — Começa e termina na final: O cantus firmus começa e termina na nota principal do modo (a final, ou tônica).
- `cf_chegada` — Chega à final por grau: A penúltima nota é a vizinha da final (o 2º grau, ou a sensível), para a chegada ser por grau conjunto.
- `cf_tamanho` — Tamanho do cantus firmus: Entre 8 e 14 notas: longo o bastante para ter forma, curto o bastante para ser dominado.
- `notas_do_modo` — Notas do modo: Cada nota pertence ao modo; a sensível (7º grau elevado) e, subindo para ela, o 6º elevado só aparecem na cadência, nos dois últimos compassos.
- `so_semibreves` — Só semibreves: O cantus firmus não tem ritmo: todas as notas são semibreves, uma por compasso.
- `cf_saltos_seguidos` — Dois saltos seguidos na mesma direção: No cantus firmus, dois saltos seguidos nunca vão na mesma direção (a única exceção são duas 3ªs, que formam um acorde).
- `cf_salto_recuperado` — Salto grande volta por grau: Depois de um salto de 4ª ou maior, a melodia volta por grau conjunto, na direção contrária.
- `contorno_tritono` — Trítono escondido no contorno: Uma subida ou descida contínua não deve ir de fá a si (ou de si a fá): o ouvido percebe o trítono entre as pontas.
- `climax_coincidente` — Clímax junto com o do cantus firmus: O ponto mais agudo do contraponto não cai no mesmo compasso do ponto mais agudo do cantus firmus.
- `paralelas_entre_tempos` — 5ªs ou 8ªs entre o tempo fraco e o forte: Na 3ª espécie, uma 5ª no tempo forte não pode vir de outra 5ª nos tempos 3–4 do compasso anterior; uma 8ª, de outra 8ª nos tempos 2–4.
- `notas_do_acorde` — Notas do acorde nos tempos fortes: Nos tempos fortes a melodia usa notas do acorde; as outras notas ficam nos tempos fracos e andam por grau (passagem ou bordadura).
- `semicadencia` — Pergunta termina em semicadência: O antecedente (a pergunta) termina no 2º, 5º ou 7º grau, sobre o acorde de dominante (V).
- `cadencia_final` — Resposta termina na tônica: O consequente (a resposta) termina na tônica, no tempo forte, vindo do 2º grau ou da sensível.
- `ideia_repetida` — A resposta começa como a pergunta: No período paralelo, os dois primeiros compassos da resposta repetem (ou quase) os dois primeiros da pergunta.
- `sequencia_do_motivo` — Sequência do motivo: Cada compasso da sequência repete o ritmo e o desenho de intervalos do motivo, começando em outra nota.
- `baixo_graus` — O baixo usa I, IV e V: Cada nota do baixo é a fundamental de um dos acordes permitidos (no começo, I, IV e V).
- `acorde_contem_melodia` — O acorde contém a nota da melodia: O acorde formado sobre cada nota do baixo precisa conter a nota da melodia que soa junto.
- `baixo_cadencia` — O baixo termina em V–I: O baixo começa na tônica e termina com a dominante indo para a tônica (5→1).
- `retrogressao` — Dominante voltando para a subdominante: Depois do V não se volta para o IV: a progressão clássica anda T → PD → D → T.
- `cifras_coerentes` — Cifra coerente com as vozes: Cada nota do baixo tem uma cifra; o baixo é o membro do acorde que a cifra indica (I6: a 3ª no baixo; V43: a 5ª), e a melodia no ataque do baixo é nota do acord
- `regra_da_oitava` — Regra da oitava: Num baixo que anda por grau, cada grau tem a sua harmonia: subindo 1 5/3, 2 V43, 3 I6, 4 ii65, 5 V, 6 IV6, 7 V65; descendo 7 V6, 6 V43/V (ou IV6), 4 V42.
- `modulacao` — Modulação: O exercício pede uma modulação de um tipo dado: a cifra muda para o tom novo pelo meio pedido (acorde-pivô, inflexão cromática ou reinterpretação enarmônica) e 
- `retrogressao_cifrada` — Retrogressão harmônica: Depois da dominante não se volta à pré-dominante (V → IV, V → ii, vii° → IV).
- `seis_quatro` — Uso do 6/4: O acorde de 6/4 só aparece como cadencial (tempo forte, sobre o 5º grau, seguido do V com o mesmo baixo) ou de passagem (baixo por grau, na mesma direção).
- `cadencias_do_plano` — Cadências do plano: A semicadência termina num V em estado fundamental; a cadência perfeita faz V(7) → I, os dois em estado fundamental, com a tônica na melodia.
- `ritmo_harmonico` — Ritmo harmônico acelera para a cadência: Os compassos antes da cadência têm mais mudanças de acorde que o começo da frase.
- `esquema` — Esquema galante: Nas etapas do esquema, o baixo e o soprano estão nos graus previstos.
- `esqueleto_preservado` — O esqueleto continua lá: Nos tempos marcados, a voz elaborada mantém as notas do esqueleto de 1ª espécie.
- `climax_no_lugar` — Clímax no compasso pedido: A nota mais aguda da voz do aluno é única e cai no compasso definido pelo exercício.
- `perfeitas_no_meio` — Poucas consonâncias perfeitas no meio: Entre o primeiro e o último compasso, no máximo o número de 5ªs e 8ªs (nos tempos fortes) que o exercício permite.
- `figuras_obrigatorias` — Figuras pedidas: O exercício pede o uso de certas figuras (cambiata, bordadura dupla).
- `dissonancias_minimas` — Dissonâncias de passagem: O exercício pede um número mínimo de dissonâncias nos tempos fracos.
- `retardos_minimos` — Retardos: O exercício pede um número mínimo de retardos: dissonâncias presas (ligadas) no tempo forte.
- `baixo_por_grau` — Baixo melódico: O baixo anda sobretudo por grau (inversões), com poucos saltos fora da cadência.

Contextos úteis: `plano: { cadencia: n, semicadencia: n, tomFinal: "G maior", acelerar: [[1,4],[5,7]], repete: [1,5] }`,
`modulacao: { para: "G maior", tipo: "pivo"|"cromatica"|"enarmonica", ate: n }`, `esqueleto: [[semínima, "G4"], …]`,
`climax: { compasso }`, `maxPerfeitas`, `minDissonancias`, `minRetardos`, `figuras: ["cambiata","bordadura_dupla"]`,
`maxSaltosBaixo`, `esquemas: […]`, `motivo: { de, em: [] }`.

## Validação (obrigatória)

```
node tests/validar_temas.js      # tem de imprimir []
```
Ele verifica: partituras legíveis; cada camada/contraste/exemplo de quebra completo passa no perfil do
capítulo (o do primeiro exercício com solução, sem as restrições) ou no `perfil` próprio do exemplo;
cada solução passa no seu perfil e fica completa; o início de cada exercício não começa aprovado;
perguntas bem formadas. Itere até zerar. Para testar uma partitura avulsa:

```
node -e 'const M=require("./web/motor.js");require("./web/regras2.js");const R3=require("./web/regras3.js");
const ex=M.lerTexto("tom: C maior\nsoprano: E5/1 D5 C5/2\nbaixo: C3/1 G2 C3/2");const ctx={nivel:6,alvo:0,cf:1,cifras:["I","V","I"]};
ctx.harmonia=R3.harmoniaDasCifras(ex,ctx);console.log(M.verificarPerfil(ex,{quintas_paralelas:"erro",cifras_coerentes:"erro"},ctx).achados)'
```

## Qualidade

- **Português do Brasil**, técnico, enxuto; o leitor é avançado em teoria. Nada de explicar o que é uma tríade.
- **Primeiro a regra histórica** (diga de onde vem: Fux, Rameau, Fenaroli, Koch, Reicha, Schoenberg,
  Aldwell & Schachter…), **depois a quebra** com repertório real e o efeito expressivo.
- Exemplos **musicais**, não só corretos: linha cantável, um clímax, cadência clara. 4 a 8 compassos.
- As notas das camadas são um **diário de decisões**: decisão, alternativa rejeitada (e por quê), checagem.
- **Não invente fatos.** Só cite obras e procedimentos de que tenha certeza; compasso exato só se souber.
  As notas de pesquisa estão em `research_notes/O que se ensina em composição/` (harmonia.md,
  modulacao.md, contraponto.md, frase_forma.md) e `reports/`; os exemplos com notas de lá são
  reconstruções: confira tudo no verificador.
- Profundidade proporcional à importância: assunto central ganha vários capítulos; assunto menor, um capítulo curto.

## Trabalho em paralelo

Vários autores escrevem ao mesmo tempo, cada um no seu módulo (já listados em `web/livro/indice.js`,
nesta ordem: contraponto, cadencias, ornamentos, setimas, forma, secundarias, aumentadas, modulacao,
raros). O validador carrega todos; **ignore problemas de capítulos que não são seus** (filtre a saída
pelos seus ids). Não faça commit nem mexa em outros arquivos. Use `depoisDe`/`antesDe` só com ids de
`web/temas.js` ou de módulos que carregam antes do seu.

Ids existentes: nível 1 `modos arquitetura elaborar continua retardos`; nível 2 `oitava baixo ritmo
esquemas`; nível 3 `superficie sentenca periodo`; nível 4 (vazio, preenchido pelos módulos).
