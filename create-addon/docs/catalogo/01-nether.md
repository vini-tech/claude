# Catálogo 01: Nether

Status: **aprovado**.

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

## O portão do Nether: Cinnabar e a Soul Forge

Para os itens T4/T5 do Nether, o jogador precisa já estar no nível da netherita.

- **Cinnabar Ore** (minério novo): aparece nos deltas de basalto, perto de lagos de lava, em
  poucas quantidades. **Só a picareta de netherita minera.** Cinábrio é um mineral vulcânico
  real, vermelho, minério de mercúrio: combina com o Nether.
- **Raw Cinnabar** → triturado/lavado → **Cinnabar** → usado na **Infernal Casing**.
- **Soul Forge** (máquina nova, uma das poucas): construída com Infernal Casing. Recebe rotação
  e queima **almas** como combustível. É o passo-chave de todos os itens T4/T5 do Nether.
  - Almas vêm de mobs que morrem a até ~8 blocos da forja (automático, com fazenda de mobs ao lado)
    ou do **Soul Sack**, que guarda as almas dos mobs que o jogador mata em qualquer lugar.
  - Valor por mob segue a vida máxima (galinha 1, zumbi 2, devastador 10, Wither 30). Guarda ~100.
  - Custo proposto: Wither Skeleton Skull 8 almas, Ancient Debris 12, Nether Star 60.
  - Detalhes completos em `DESIGN.md`.

Resultado: quem tem a Soul Forge já tem netherita, então automatizar netherita e a estrela do
Nether não "pula" nenhuma etapa do jogo, só tira o trabalho repetitivo.

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
- **Soul Forge:** Charred Skull → Wither Skeleton Skull
- História: um crânio comum é carbonizado e depois recebe uma alma na forja.
- Portão: Soul Forge (nível netherita).
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
- **Soul Forge** com uma **Nether Star como catalisador** (não é consumida):
  Awakened Wither Core → Nether Star
- Portão duplo: a Soul Forge (nível netherita) e uma estrela que o jogador precisa ter
  conseguido matando o Wither pelo menos uma vez.
- Custo comparável a invocar e matar o Wither de verdade. A diferença é que o desafio
  passa a ser montar a fábrica inteira (crânios + bolos de blaze + experiência).

### Ancient Debris (Detrito Ancestral) · T4
*Origem: o fundo do Nether, sob calor e pressão. Raro e muito útil (netherita).*

- **Montagem sequencial** (base: Basalt, 5 loops):
  1. Implantador: Powdered Obsidian (pressão)
  2. Implantador: Gold Ingot (o ouro que vira netherita)
  3. Bica: 250 mB de lava (calor)
  4. Prensa
- Resultado: **Unstable Debris** (item novo) · 75% de sucesso. Sucata: Netherrack + Gold Nugget.
- **Soul Forge:** Unstable Debris → Ancient Debris
- Portão: Soul Forge (nível netherita).
- Custo por detrito: 5 lingotes de ouro + 5 obsidianas + 1250 mB de lava. Um lingote de netherita
  (4 detritos + 4 ouros) sai por ~24 ouros e 20 obsidianas: caro, mas automatizável.
- História: imita a formação geológica, camada por camada, sob pressão e calor.

### Basalt (Basalto) · T1
*Origem: deltas de basalto. Comum.*

- **Compactador aquecido:** 1 Soul Soil + 1 Ice + 250 mB de lava → 2 Basalt
- História: imita a geração natural (lava sobre solo de almas, resfriada por gelo).

### Nether Gold Ore (Minério de Ouro do Nether) · T1
- **Compactador aquecido:** 1 Netherrack + 2 Gold Ingot → 1 Nether Gold Ore
- Custo ≥ o que o triturador devolve (18 pepitas = 2 lingotes). Sem duplicação.

### Nether Quartz Ore (Minério de Quartzo do Nether) · T1
- **Compactador aquecido:** 1 Netherrack + 3 Nether Quartz → 1 Nether Quartz Ore
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
| Unstable Debris | intermediário do Ancient Debris |
| Cinnabar Ore | minério novo do Nether, só picareta de netherita minera |
| Raw Cinnabar, Cinnabar | material do portão do Nether |
| Infernal Casing | carcaça das máquinas do Nether |
| Soul Forge | máquina especial do Nether |

Mais os itens "incompletos" automáticos das montagens sequenciais.

## Flora do Nether

### Shroomlight, Warped Wart Block · T1
- **Compactador aquecido:** 1 Crimson Fungus + 3 Bone Meal + 1 Glowstone Dust → 1 Shroomlight + 1 Nether Wart Block
- **Compactador aquecido:** 1 Warped Fungus + 3 Bone Meal → 2 Warped Wart Block
- História: o que cresce na copa de um fungo gigante. Os troncos (Crimson/Warped Stem) ficam fora do escopo,
  porque fazendas de fungos gigantes já são fáceis com o Create.

### Crimson Nylium, Warped Nylium · T1
- **Implantador** segurando o fungo (não é consumido) sobre Netherrack → Crimson/Warped Nylium
- História: o fungo "contamina" a netherrack.

### Crimson Roots, Warped Roots, Nether Sprouts, Weeping Vines, Twisting Vines · T1
- **Implantador** com Bone Meal sobre Crimson Nylium → Crimson Nylium + 2 Crimson Roots + 25% Weeping Vines
- **Implantador** com Bone Meal sobre Warped Nylium → Warped Nylium + 2 Warped Roots + 1 Nether Sprouts + 25% Twisting Vines
- História: é exatamente o que farinha de osso faz no nylium. O bloco volta inteiro, as plantas saem como "colheita".

### Wither Rose · T2
- **Implantador** segurando um Wither Skeleton Skull (não é consumido) sobre Poppy → Wither Rose
- História: o toque do Wither murcha a flor. Barata depois que se tem um crânio, porque é só decorativa
  (e ingrediente de ensopado suspeito).
