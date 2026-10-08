# Catálogo 06: Mobs do Overworld

Status: **aprovado**.

Nomes de itens novos em inglês. Tiers conforme `DESIGN.md`.
Já resolvidos em outros catálogos: Totem of Undying (04), Ender Pearl (02).

## A assinatura dos mobs

Cada drop sai de uma pequena "linha de produção" que imita a vida do mob:
o que ele come, onde vive, o que acontece com ele.

## Animais de criação: ração e engorda

As carnes **não têm receita** (fazendas de carne já são fáceis). Em vez disso, o mod adiciona
**rações** feitas com as máquinas do Create, que deixam os animais mais gordos e com mais carne.

**Base: Fodder (item novo)**
- **Moedor:** Wheat → 2 Fodder
- **Moedor:** Wheat Seeds / Beetroot Seeds / Melon Seeds / Pumpkin Seeds → 1 Fodder

**Rações (misturador), cada animal só come a sua**

| Ração (item novo) | Receita | Animais |
|---|---|---|
| Pasture Feed | 2 Fodder + 250 mB Milk | vaca, ovelha (e mooshroom) |
| Swill | 2 Fodder + 1 Carrot + 1 Potato | porco |
| Chicken Feed | 2 Fodder + 1 Feather | galinha |
| Rabbit Feed | 1 Fodder + 1 Carrot + 1 Dandelion | coelho |

**Engorda**
- Cada vez que come, o animal sobe um nível de engorda, até **3**.
- **+1 carne por nível** ao morrer.
- Fica visivelmente um pouco maior a cada nível e solta partículas ao comer.
- A ração **não** serve para reproduzir (isso continua com os itens do vanilla).

**Formas de alimentar**
1. À mão: clicar no animal com a ração.
2. Implantador do Create usando a ração no animal.
3. **Feeding Trough (cocho, bloco novo):** você deposita ração nele (à mão, funil, calha ou esteira),
   e os animais num raio de ~8 blocos **vão sozinhos até o cocho e comem**, até chegar ao nível 3.
   O nível de ração aparece no modelo do bloco. Feito no crafting com tábuas e chapas de ferro/andesito.

Assim um curral automatizado fica simples: esteira trazendo ração até o cocho, animais engordando
sozinhos, e o abate quando quiser.

Fora do escopo agora: Raw Beef, Raw Porkchop, Raw Mutton, Raw Chicken, Raw Rabbit, Rabbit Hide.

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
- **Assombrar:** qualquer carne crua (vinda da fazenda) → 2 Rotten Flesh
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
- O chifre sai com **um dos 8 sons sorteado**, como o que a cabra solta no jogo.
  (Precisa de código próprio: as receitas do Create não sorteiam NBT.)

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
| Pasture Feed, Swill, Chicken Feed, Rabbit Feed | rações (engorda) |
| Feeding Trough | cocho de ração (bloco) |
| Fossil Fragment | intermediário do Bone |
| Stretched Hide, Hollow Hide | intermediários da Phantom Membrane |
| Horn Blank | intermediário do Goat Horn |
| Carving Chisel | ponteira de implantador (cabeças) |
