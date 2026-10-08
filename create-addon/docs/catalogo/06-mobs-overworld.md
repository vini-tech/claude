# Catálogo 06: Mobs do Overworld

Status: **proposta, aguardando revisão**.

Nomes de itens novos em inglês. Tiers conforme `DESIGN.md`.
Já resolvidos em outros catálogos: Totem of Undying (04), Ender Pearl (02).

## A assinatura dos mobs

Cada drop sai de uma pequena "linha de produção" que imita a vida do mob:
o que ele come, onde vive, o que acontece com ele.

## Animais de criação (família)

**Base comum: Fodder (ração, item novo)**
- **Moedor:** Wheat → 2 Fodder
- **Moedor:** Wheat Seeds / Beetroot Seeds / Melon Seeds / Pumpkin Seeds → 1 Fodder

**Toque de cada animal: misturador + prensa**

| Item | Passo 1: Misturador | Passo 2 | História |
|---|---|---|---|
| Raw Beef · T1 | 2 Fodder + 250 mB **Milk** → **Cattle Feed** (item novo) | **Compactador:** Cattle Feed + 1 Leather → 2 Raw Beef | a vaca come capim e dá leite e couro |
| Raw Porkchop · T1 | 2 Fodder + 1 Carrot + 1 Potato → **Swill** (item novo) | **Compactador:** Swill → 2 Raw Porkchop | o porco come restos de horta |
| Raw Mutton · T1 | 2 Fodder + 100 mB água → Fodder molhada | **Compactador:** Fodder molhada + 1 White Wool → 2 Raw Mutton | a ovelha come capim e cresce lã |
| Raw Chicken · T1 | 2 Fodder (de sementes) + 1 Feather → **Chicken Feed** (item novo) | **Compactador:** Chicken Feed → 1 Raw Chicken | a galinha come sementes |
| Raw Rabbit · T1 | 1 Fodder + 1 Carrot + 1 Dandelion → **Rabbit Feed** (item novo) | **Compactador:** Rabbit Feed → Raw Rabbit + Rabbit Hide | o coelho come cenoura e dente-de-leão |

(Itens "Fodder molhada" podem ser o mesmo Cattle Feed para não multiplicar itens: decidimos na implementação.)

### Egg (Ovo) · T1
- **Misturador:** 1 Chicken Feed + 1 Calcite (moída, vira a casca de cálcio) + 100 mB água → Egg
- História: ração + cálcio = casca.

### Feather (Pena) · T1
- **Implantador segurando Shears** (não consumida, só desgasta) sobre Raw Chicken → 3 Feather
- História: "depenar" o frango. O frango é consumido.

### Rabbit's Foot (Pé de Coelho) · T2
*Amuleto da sorte, usado no totem e em poções.*
- **Montagem sequencial** (base: Rabbit Hide, 1 loop):
  1. Implantador: Golden Carrot (sorte)
  2. Implantador: String (amarrar)
  3. Prensa
- Resultado: Rabbit's Foot · 100%

## Mortos-vivos e monstros

### Bone (Osso) · T1
1. **Montagem sequencial** (base: Calcite, 2 loops):
   1. Bica: 100 mB água
   2. Implantador: Cobblestone (sedimento)
   3. Prensa
   - Resultado: **Fossil Fragment** (item novo)
2. **Triturador:** Fossil Fragment → 2 Bone + 25% Bone Meal
- História: fossilização ao contrário. Os fósseis do deserto e do pântano são feitos de osso.
- Sem farinha de osso como insumo (moer osso dá até 6 farinhas, o que criaria duplicação).

### Rotten Flesh (Carne Podre) · T1
- **Assombrar:** qualquer carne crua → 2 Rotten Flesh
- História: a carne é "corrompida" pela morte. Zumbis são mortos-vivos.

### Spider Eye (Olho de Aranha) · T2
- **Misturador:** 1 Poisonous Potato + 1 Sweet Berries + 1 String → 1 Spider Eye
- História: o veneno (batata venenosa), o vermelho do olho (bagas) e a teia (linha).

### Phantom Membrane (Membrana de Phantom) · T3
*Phantoms nascem para quem não dorme. Útil (consertar élitro, queda lenta).*
1. **Prensa:** Leather → **Stretched Hide** (item novo, couro esticado)
2. **Assombrar:** Stretched Hide → **Hollow Hide** (item novo): a pele vira de morto-vivo
3. **Bica:** 250 mB de **Potion of Night Vision** sobre Hollow Hide → Phantom Membrane
- História: o phantom é um morto-vivo da noite. Couro fino, assombrado, impregnado de "noite".
- Três máquinas diferentes, uma por característica do mob.

## Montanhas, colmeias e criaturas raras

### Goat Horn (Chifre de Cabra) · T2
1. **Compactador:** 2 Bone + 1 Calcite → **Horn Blank** (item novo)
2. **Serra mecânica:** Horn Blank → Goat Horn
- História: osso e calcita das montanhas, esculpidos na serra.
- O chifre tem 8 variações de som; a receita gera o "Ponder" (o comum). As outras variações
  podem vir depois com toques extras, se você quiser.

### Honeycomb (Favo de Mel) · T1
1. **Misturador aquecido:** 3 Sugar + 1 flor qualquer + 250 mB água → 250 mB **Honey** (fluido do Create)
   - 3 açúcares porque uma garrafa de mel (250 mB) vira 3 açúcares no vanilla: assim não há duplicação.
2. **Compactador:** 250 mB Honey → 1 Honeycomb
- História: as abelhas transformam o néctar das flores em mel, e o mel vira cera.
- Bônus: o mod passa a produzir mel do Create sem colmeia.

### Bee Nest (Ninho de Abelha) · T2
- **Montagem sequencial** (base: Oak Log ou Birch Log, 1 loop):
  1. Implantador: Honeycomb
  2. Implantador: Honeycomb
  3. Serra (escavar o ninho)
- Resultado: Bee Nest (vazio)

### Sniffer Egg (Ovo de Farejador) · T3
*Ruínas do oceano quente. Raro, utilidade baixa.*
- **Montagem sequencial** (base: Egg, 1 loop):
  1. Implantador: Torchflower Seeds
  2. Implantador: Pitcher Pod
  3. Implantador: Moss Block
  4. Bica: 250 mB água
- Resultado: Sniffer Egg · 90%. Sucata: Moss Block.
- História: um ovo "antigo", alimentado com as sementes que só o farejador encontra.
- Depende de: Torchflower Seeds e Pitcher Pod (catálogo de Arqueologia).

## Cabeças de mobs (família, ponteira Carving Chisel)

**Carving Chisel (ponteira de implantador, item novo):** feita no crafting com Andesite Alloy +
Iron Ingot. O implantador segura o cinzel e esculpe; o cinzel não é consumido (só desgasta).

1. **Skeleton Skull** · T2: **Implantador** com Carving Chisel sobre Bone Block → Skeleton Skull
   - É a **base** das outras cabeças e do Wither Skeleton Skull (catálogo do Nether).
2. **Variantes** (montagem sequencial sobre Skeleton Skull, 1 loop, cada uma com o seu toque):

| Cabeça | Passos | História |
|---|---|---|
| Zombie Head · T2 | Rotten Flesh → Rotten Flesh → Carving Chisel | pele podre moldada no crânio |
| Creeper Head · T2 | Gunpowder → Lime Dye → Carving Chisel | pólvora e o verde do creeper |
| Piglin Head · T2 | Gold Ingot → Crimson Fungus → Carving Chisel | ouro e a floresta carmesim |
| Dragon Head · T2 | Dragon's Breath → Obsidian → Carving Chisel | o sopro roxo e a obsidiana dos pilares do End |

## Itens novos desta categoria

| Item | Uso |
|---|---|
| Fodder | base da família dos animais |
| Cattle Feed, Swill, Chicken Feed, Rabbit Feed | rações de cada animal |
| Fossil Fragment | intermediário do Bone |
| Stretched Hide, Hollow Hide | intermediários da Phantom Membrane |
| Horn Blank | intermediário do Goat Horn |
| Carving Chisel | ponteira de implantador (cabeças) |
