# Pesquisa: como addons e modpacks do Create desenham receitas

Fontes principais (código lido diretamente): KubeJS do Create: Above and Beyond (CAB) e CABIN,
Create: Astral, receitas do Create, Dreams & Desires e Create Mechanical Spawner.
Opinião de jogadores veio só de trechos de busca (Reddit/moddex bloqueados), amostra pequena.

## Princípios que vamos adotar no Synthesis

1. **A origem é o catalisador.** Cada dimensão/bioma vira uma "assinatura" de processo:
   lavagem = Overworld/água, assombrar (fogo de alma) = Nether/morte, e um processamento
   próprio do End para os itens do End. Quem olha a receita reconhece de onde o item vem.
2. **Imitar o processo natural.** Basalto = solo de almas + gelo azul + lava; coral = crescimento
   em água; sculk = algo que "absorve" experiência. A receita explica o item.
3. **Fluido como "DNA" ou propriedade.** Base sólida vem do lugar de origem, o fluido dá a
   característica (como o Create faz com cinder flour + poção → glowstone/redstone).
4. **Dificuldade em degraus físicos**: sem calor → aquecido → superaquecido; depois mecanismos e
   sequenced assembly com loops; no topo, insumos de mais de uma dimensão e máquina especial.
5. **Loops com narrativa.** Loops de sequenced assembly representam crescer, temperar, forjar,
   com itens incompletos nomeados por estágio.
6. **Variância controlada.** Nada de "1% de chance e reza". Usar fragmentos que se juntam
   (shards) ou sucata reciclável; sucesso ≥ ~75% quando houver chance.
7. **Itens raros no topo de uma árvore**, não numa receita isolada: o item difícil exige
   produtos de outras linhas (ex.: élitra precisa de material do End + membrana de phantom).
8. **Catalisadores reutilizáveis** para itens muito valiosos: a barreira fica em construir o
   catalisador, não em cada unidade produzida.
9. **Famílias de variantes**: uma base comum e o toque final temático (ex.: discos de música
   "gravados" a partir de um disco virgem, como o vinyl printer do Astral).
10. **Máquinas novas só para rituais especiais**, de preferência com condição de mundo
    (céu aberto, altura, escuridão, dimensão), como o antigo chromatic compound.

## Armadilhas a evitar

- Chance baixa + espera longa (loteria AFK). Crítica recorrente: "chato, não difícil".
- Esmagar bloco comum e torcer por item raro (Ultimate Factory: coral → coração do mar).
- Duplicação barata que quebra a economia (diamante a partir de zinco).
- Passos manuais repetidos e linhas longas sem nenhuma decisão.
- Tema desconectado do item.
- Rotas triviais duplicadas para o mesmo item (recipe bloat).

## Notas por fonte

- **CAB**: mecanismos em tiers como moeda de progressão; versão manual cara + automatizada barata;
  loops como maturação (cristal crescendo com 4 loops de filling); cascatas de emptying com subproduto;
  catalisador não consumido; puzzle de alquimia gerado pela seed do mundo, com falhas que valem algo.
- **Dreams & Desires**: tipos de ventilador por dimensão (dragon breathing, seething, freezing);
  fragmentos (diamond shard) em vez do item inteiro; compactação hidráulica imitando geração natural.
- **Mechanical Spawner**: fluido por espécie feito de fluido genérico + drop característico;
  calor proporcional à raridade; Wither exige fluido de outro mob (árvore de dependência).
- **Astral**: telescópio de rádio que só funciona com céu aberto → dados → impressora de vinil → disco;
  élitra por mechanical crafting 5×6 com vários subsistemas; tridente de prismarinho + pó de diamante.
- **Create nativo**: haunting como "corrupção" (cogumelo → fungo do Nether, tinta → tinta brilhante);
  poção como fluido-essência; saídas ponderadas com sucata no precision mechanism.

## Fontes

- https://github.com/simibubi/Above-and-Beyond
- https://github.com/ThePansmith/CABIN
- https://github.com/Laskyyy/Create-Astral
- https://github.com/oierbravo/create-mechanical-spawner
- https://github.com/LopyLuna/Create-Dreams-and-Desires
- https://github.com/Creators-of-Create/Create
- https://www.curseforge.com/minecraft/mc-mods/create-ultimate-factory
- https://modrinth.com/datapack/create-renewable-industry
- https://www.curseforge.com/minecraft/mc-mods/create-more-renewable
- https://moddex.gg/modpack/create-arcane-engineering/reviews/2631
- https://moddex.gg/modpack/create-chronicles-bosses-and-beyond
- https://reddit.rtrace.io/r/feedthebeast/comments/12w7cy8/
