# Handoff: Create: Synthesis

Resumo de tudo que foi conversado e decidido até aqui, para continuar o trabalho em outra sessão
(local ou na nuvem). Documento interno, em português.

## 1. O projeto

**Create: Synthesis** (`create_synthesis`): add-on para o mod **Create** no **Fabric**, que dá uma rota de
produção temática, usando as máquinas do Create, para cada item **obtenível no survival** que **não tem
receita de crafting**.

**Princípio central:** o objetivo é **automatizar, não facilitar**. Nenhuma rota pode deixar o jogador pular
a progressão necessária para conseguir o item na mão.

## 2. Ambiente e versões

| | Versão |
|---|---|
| Minecraft | 1.20.1 (a versão Fabric mais recente do Create) |
| Create Fabric | 6.0.8.1 (build 1744) |
| Fabric Loader / API | 0.17.2 / 0.92.6+1.20.1 |
| Loom / Gradle | 1.10 / 9.1.0 |
| Java | 21 (compila para 17) |

- Por que 1.20.1: o port Fabric do Create para 1.21.1 foi abandonado (sem commits desde março de 2025) e o
  Create para 26.x ainda está sendo portado só para NeoForge. O usuário preferiu Fabric mesmo assim.
- Repositório: `vini-tech/claude`, branch `claude/admiring-brown-e4z1rw`, pasta `create-addon/`.
- Pacote Java: `com.vinitech.createsynthesis`.

### Como rodar
- Jogo de teste: `gradlew.bat runClient` (Windows) ou `./gradlew runClient`.
- Servidor de teste: `./gradlew runServer` (no log aparece `Create: Synthesis loaded N recipes`).
- Gerar receitas: `python3 tools/datagen.py` (escreve em `src/generated/resources`; nunca editar à mão).
- Build: `./gradlew build` → `build/libs/create_synthesis-<versão>.jar`.

### Notas do ambiente na nuvem (não se aplicam ao PC local)
- A rede precisou liberar os mavens do Fabric, Mojang, Create (`mvn.devos.one`, `maven.createmod.net`),
  Parchment, Modrinth etc.
- O Maven Central devolvia 429; foi usado um init script em `~/.gradle/init.d/central-mirror.gradle`
  apontando para o espelho do Google. **Não** faz parte do projeto.
- Cuidado com `pkill -f`/`pgrep -f` com padrões que aparecem na própria linha de comando: mata o shell.
  Usar `pgrep -f '^/usr/lib/jvm.*fabric\.dli'`.

## 3. Convenções combinadas com o usuário

- **Tudo que chega ao jogador em inglês** (nomes, descrições, tooltips, Ponder, README). `en_us` primário,
  `pt_br` como tradução. **Conversa e documentos internos em português.**
- Commits podem ser em português.
- Antes de implementar, cada categoria passa por um **catálogo de receitas** para aprovação (`docs/catalogo/`).
- Ser **criativo**, inclusive em itens simples: cadeias de várias máquinas quando cada passo conta uma história.
- O usuário gosta de ser consultado em decisões de design, mas espera que eu proponha com uma recomendação.

## 4. Decisões de design (detalhes em `DESIGN.md`)

### Escopo
- **Dentro:** drops de mobs, tesouros, blocos naturais, flores e plantas não triviais.
- **Fora:** impossíveis no survival (bedrock, ovos de spawn...); o que o Create/vanilla já produz
  (ex.: terra com grama pela bica); baldes com peixes/axolote; **carnes cruas, pele de coelho e peixes crus**;
  **madeiras** (troncos, folhas, mudas, maçã, azaleias, troncos do Nether) e **colheitas**; mecânicas simples
  do jogo (baldes de água/lava/leite, poções, concreto, troncos descascados, caixas de shulker tingidas...).
- **Ovo do dragão:** sem receita (só teria se fosse usado em outra receita).
- Inventário completo gerado dos dados do jogo: `docs/inventario.md` (scripts em `docs/tools/`).

### Dificuldade
- Guiada por **utilidade + raridade** (élitra difícil; disco raro mas inútil, moderado).
- Tiers T1 (barato) → T5 (lendário).
- **Regra anti-duplicação:** uma receita nunca custa menos do que o Create devolve ao triturar/moer o resultado
  (ex.: minério de ouro do Nether ≥ 2 lingotes; sela ≥ 4 couros; mel ≥ 3 açúcares; osso sem farinha de osso).
- Fluido como "DNA": ferramenta para algumas receitas, não regra.
- Itens de variantes: **aleatórios** quando o jogo também é aleatório (chifre de cabra, 12 discos comuns,
  20 cacos de cerâmica, 15 moldes de acabamento). Exceções com receita própria: Pigstep, otherside, Relic,
  molde Silence, molde de upgrade de netherita.

### Portões de progressão (T4/T5)
- Cada **dimensão** tem **uma máquina especial**, feita com um **minério novo** que só sai com a picareta do
  nível do item. Itens T4/T5 passam por ela; os mais valiosos exigem também um **exemplar do item como
  catalisador** (não consumido).
- Máquinas: **sem interface, sem energia elétrica**; só rotação, blocos no mundo e óculos do engenheiro.
  Cada uma com um diferencial ligado a um **recurso do mundo**:

| Dimensão | Máquina | Minério (picareta) | Recurso |
|---|---|---|---|
| Nether | Soul Forge | Cinnabar (netherita) | **almas**: mobs que morrem a ~8 blocos ou Soul Sack (guarda almas de mobs mortos pelo jogador); valor pela vida máxima; ~100 de estoque |
| End | Rift Chamber | Purpurite (netherita) | **vazio**: só funciona sem nenhum bloco embaixo até o fundo do mundo (sem exigência de altura) |
| Deep Dark | Echo Chamber | Dioptase (diamante) | **silêncio**: barulho a ~8 blocos pausa; lã isola |
| Overworld | Solar Crucible | Sunstone (diamante, picos de montanha) | **sol**: dia e céu aberto; velocidade segue a altura do sol |

### Acoplamentos para máquinas do Create (famílias fáceis com muitas variantes)
- Matrizes da prensa: **Engraving Die** (discos), **Sherd Stamp** (cacos), **Template Die** (moldes).
- Ponteiras do implantador: **Carving Chisel** (cabeças), **Coral Graft** (corais).

### Mecânicas novas
- **Rações:** Fodder (moída) → **Animal Feed** (única para animais terrestres) e **Fish Feed**.
  Engordam até 3 níveis, +1 carne/peixe por nível ao morrer, animal fica visivelmente maior.
  Alimentar à mão, com implantador, ou pelo **Feeding Trough** (animais a ~8 blocos vão comer sozinhos).
  Fish Feed jogada na água vira **flocos** (modelo 3D pequeno) que os peixes comem.
- **Soaked Hide** seca sozinho no inventário em 5 minutos reais (ou defumado no ventilador) → Tanned Leather.
- Frasco de experiência: essência em lotes de 50 mB, 5 partes por frasco.

## 5. Catálogos (todos aprovados): `docs/catalogo/`

01 Nether · 02 End · 03 Deep Dark · 04 Overworld elite (totem, maçã encantada, coração do mar, tridente) ·
05 Minérios e terreno · 06 Mobs do Overworld · 07 Oceano · 08 Tesouros · 09 Discos · 10 Arqueologia ·
11 Moldes de ferraria · 12 Flora.

Pesquisa de inspiração (CAB, Astral, Dreams & Desires, Mechanical Spawner...): `docs/pesquisa.md`.

## 6. Estado da implementação

### Fase 1: concluída
- 126 receitas que só usam itens do vanilla e do Create, geradas por `tools/datagen.py`.
- 19 itens de transição (`SequencedAssemblyItem`) registrados por `SynthesisItems`, com a lista gerada em
  `SynthesisIncompleteItems.java`; modelos reaproveitam a textura do item final.
- Verificado: build passa e o servidor carrega as 126 receitas sem erro.
- **Não verificado:** as máquinas processando cada receita dentro do jogo (precisa de `runClient` com tela).

### Notas técnicas
- Fluidos no Fabric em droplets: 1 mB = 81 (o gerador converte).
- Implantador sem consumir o item: `"keepHeldItem": true`.
- Fan "defumar" usa receitas `minecraft:smoking`; "assombrar" é `create:haunting`; "lavar" é `create:splashing`.
- Calor: `"heatRequirement": "heated"` ou `"superheated"`.
- **Conflitos na bacia:** o Create escolhe a receita com mais ingredientes, e as receitas de crafting
  (blocos 3x3, tijolos 2x2, botas...) roubavam as nossas. O mod corrige com `BasinRecipeRules` (mixin em
  `BasinOperatingBlockEntity`): as nossas receitas vão primeiro quando estão completas, e se completarem
  no meio de um ciclo a máquina troca para a nossa antes de aplicar. Com entrada desbalanceada, o **filtro
  da bacia** (mecânica do Create) garante a receita. O usuário **não** quer calor como solução: calor só
  quando a receita "cozinha" algo. Uma receita nossa não pode ser feita só com ingredientes de uma receita
  do vanilla/Create (por isso a teia leva slime: só linha seria lã).
  Conferir sempre com `python docs/tools/conflicts.py` (depois de um build).
- Ambiente local (Windows): o caminho do projeto não pode ter acento (o Fabric não acha o jogo). Usar uma
  unidade `subst` ou mover o projeto. JDK 21 em `~\.jdks`.

### Fase 2: próxima
Itens novos com **texturas definitivas no estilo do Create**:
- Intermediários: Fodder, Animal Feed, Fish Feed, Nacre, Fossil Fragment, Horn Blank, Stretched/Hollow Hide,
  Soaked Hide, Tanned Leather, Saddle Frame, Rough Bell, Blank/Polished Blank Disc, Clay Tablet, Blank Sherd,
  Ancient Soil, Blank Template, Golden Effigy, Gilded Apple, Tide Pearl, Wing Frame etc.
- Fluido Experience Essence.
- Acoplamentos (3 matrizes, 2 ponteiras) e sua lógica na prensa/implantador; resultados aleatórios.
- Comportamentos: Soaked Hide secando, flocos de Fish Feed, engorda dos animais, Feeding Trough, Soul Sack.

### Fase 3: depois
As 4 máquinas especiais e os 4 minérios novos (geração no mundo, nível de picareta via tags do Fabric),
uma por vez, com modelo, animação e cena do Ponder.

## 7. Pendências e perguntas em aberto
- A calcita ainda aparece nas receitas do **osso** (fóssil) e do **chifre de cabra**; o usuário trocou a calcita
  de outras receitas e pode querer variar estas também.
- O usuário ainda não testou nada no jogo; sugerir `runClient` e buscar `@create_synthesis` no EMI.
