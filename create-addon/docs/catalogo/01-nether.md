# Catálogo 01: Nether

Status: **proposta, aguardando revisão**.

Nomes de itens novos estão em inglês (é o que vai para o jogo). Tiers conforme `DESIGN.md`
(T1 barato → T5 lendário).

## A assinatura do Nether

O que conecta as receitas desta categoria (sem que fiquem parecidas entre si):

- **Assombrar** (ventilador atrás de fogo de alma) = alma, morte, corrupção.
- **Lava e calor** do queimador de blaze = o fogo do Nether.
- **Areia/solo de almas** = as almas presas do Vale das Almas.
- **Ouro** = os piglins e os bastiões.

Cada item puxa a parte do Nether de onde ele vem: fortaleza, bastião, vale das almas,
florestas carmesim/distorcida, deltas de basalto ou o fundo do Nether.

## Receitas

### Crying Obsidian (Obsidiana Chorosa) · T2
*Origem: portais em ruínas. Utilidade média (âncora de renascimento).*

- **Misturador aquecido:** 1 Obsidian + 1 Amethyst Shard + 100 mB de água → 1 Crying Obsidian
- História: a ametista dá o brilho roxo, a água vira as "lágrimas", o calor funde tudo.

### Ghast Tear (Lágrima de Ghast) · T3
*Origem: ghasts do Vale das Almas. Rara, útil (poção de regeneração, cristal do End).*

- **Misturador aquecido:** 1 Crying Obsidian + 4 Soul Sand → 1 Ghast Tear + 1 Obsidian + 4 Soul Soil
- História: o calor "espreme" as lágrimas das almas presas na areia. A areia perde as almas
  e vira solo de almas; a obsidiana para de chorar e volta a ser obsidiana comum.
- Sacada: a obsidiana funciona como **catalisador que circula**. Ela volta para a receita
  de Crying Obsidian, e o jogador monta um loop de logística em vez de consumir tudo.

### Blaze Rod (Vara de Blaze) · T3
*Origem: blazes das fortalezas. Muito útil (poções, pó de blaze, Create).*

- **Misturador superaquecido:** 2 Glowstone Dust + 2 Cinder Flour + 250 mB de lava → 1 Blaze Rod
- História: o queimador superaquecido já tem um blaze preso dentro (que o jogador precisou
  capturar numa fortaleza). Alimentado com pó de netherrack e luz do Nether, ele
  "solidifica" uma vara nova.
- Gate natural: superaquecer exige bolo de blaze, ou seja, ter progredido no Create.

### Wither Skeleton Skull (Crânio de Esqueleto Wither) · T4
*Origem: esqueletos wither das fortalezas. Raro e importante (invocar o Wither).*

- **Montagem sequencial** (base: Skeleton Skull, 3 loops):
  1. Implantador: Coal (o que os esqueletos wither dropam)
  2. Bica: 250 mB de lava (queimar)
  3. Prensa (compactar o carvão no osso)
- Resultado: **Charred Skull** (item novo) · 80% de sucesso. Sucata: Bone Meal + Coal.
- **Assombrar:** Charred Skull → Wither Skeleton Skull
- História: um crânio comum é carbonizado e depois recebe uma alma no fogo de alma.
- Depende do Skeleton Skull (categoria Mobs do Overworld).

### Nether Star (Estrela do Nether) · T5
*Origem: o Wither. Lendária, muito útil (sinalizador).*

1. **Mecânico (mechanical crafter)**, no formato da invocação do Wither: 3 Wither Skeleton Skull
   em cima + 4 Soul Sand no "T" → **Dormant Wither Core** (item novo)
2. **Montagem sequencial** (base: Dormant Wither Core, 4 loops):
   1. Implantador: Experience Nugget (a vida que o Wither drena)
   2. Implantador: Blaze Cake (energia)
   3. Bica: 500 mB de lava
   4. Prensa
- Resultado: **Awakened Wither Core** (item novo) · 100%, mas cada loop é caro
- **Assombrar:** Awakened Wither Core → Nether Star
- Custo comparável a invocar e matar o Wither de verdade, mas sem a luta: o desafio
  passa a ser montar a fábrica inteira (crânios + bolos de blaze + experiência).
- **Candidata a máquina especial.** Se quisermos uma das poucas máquinas novas aqui, o último
  passo poderia ser um ritual ("Soul Forge") no lugar do ventilador. Decidimos depois.

### Ancient Debris (Detrito Ancestral) · T4
*Origem: o fundo do Nether, sob calor e pressão. Raro e muito útil (netherita).*

- **Montagem sequencial** (base: Basalt, 5 loops):
  1. Implantador: Powdered Obsidian (pressão)
  2. Implantador: Gold Ingot (o ouro que vira netherita)
  3. Bica: 250 mB de lava (calor)
  4. Prensa
- Resultado: Ancient Debris · 75% de sucesso. Sucata: Netherrack + Gold Nugget.
- Custo por detrito: 5 lingotes de ouro + 5 obsidianas + 1250 mB de lava. Um lingote de netherita
  (4 detritos + 4 ouros) sai por ~24 ouros e 20 obsidianas: caro, mas automatizável.
- História: imita a formação geológica, camada por camada, sob pressão e calor.

### Basalt (Basalto) · T1
*Origem: deltas de basalto. Comum.*

- **Compactador:** 1 Soul Soil + 1 Ice + 250 mB de lava → 2 Basalt
- História: imita a geração natural (lava sobre solo de almas, resfriada por gelo).

### Nether Gold Ore (Minério de Ouro do Nether) · T1
- **Compactador:** 1 Netherrack + 2 Gold Ingot → 1 Nether Gold Ore
- Custo ≥ o que o triturador devolve (18 pepitas = 2 lingotes). Sem duplicação.

### Nether Quartz Ore (Minério de Quartzo do Nether) · T1
- **Compactador:** 1 Netherrack + 3 Nether Quartz → 1 Nether Quartz Ore
- Triturar devolve ~2,25 quartzo. Sem duplicação.

### Gilded Blackstone (Pedra-Negra Dourada) · T1
*Origem: bastiões.*
- **Implantador** segurando um Gold Ingot sobre Blackstone, 2 vezes (montagem sequencial curta,
  2 loops) → Gilded Blackstone
- Custo de 2 lingotes = o que o triturador devolve. Sem duplicação.

### Piglin Banner Pattern (Padrão "Snout") · T1
*Origem: baús dos bastiões. Só decorativo.*
- **Implantador** segurando Gilded Blackstone (não é consumido) sobre Paper → Snout Banner Pattern
- História: a pedra dourada do bastião serve de **carimbo**. Feito o carimbo, cada folha sai barata.

### Piglin Head (Cabeça de Piglin) · T2
*Origem: piglin morto por creeper carregado. Decorativa.*
- Faz parte da **família das cabeças** (base comum + toque único), que vou detalhar no
  catálogo de Mobs do Overworld. O toque do piglin: Gold Ingot + Crimson Fungus.

### Pigstep (disco) · T2
- Faz parte da **família dos discos**, detalhada no catálogo de Discos. O toque do Pigstep virá
  do bastião (Gilded Blackstone).

## Itens novos desta categoria

| Item | Uso |
|---|---|
| Charred Skull | intermediário do Wither Skeleton Skull |
| Dormant Wither Core | intermediário da Nether Star |
| Awakened Wither Core | intermediário da Nether Star |

Mais os itens "incompletos" automáticos das montagens sequenciais.

## Pendente da regra de flora

Se troncos/plantas do Nether entrarem no escopo, uma receita só cobriria vários itens:

- **Compactador:** 1 Crimson Fungus + 3 Bone Meal → 4 Crimson Stem + 2 Nether Wart Block + 20% Shroomlight
- **Compactador:** 1 Warped Fungus + 3 Bone Meal → 4 Warped Stem + 2 Warped Wart Block + 20% Shroomlight
- **Implantador** segurando o fungo (não é consumido) sobre Netherrack → Crimson/Warped Nylium
- Raízes, brotos e cipós do Nether: excluídos como flora.
- Wither Rose: é flor, excluída.

Isso imita um fungo gigante crescendo: tronco, blocos de verruga e luz-de-cogumelo.
