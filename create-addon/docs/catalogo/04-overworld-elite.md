# Catálogo 04: Overworld, máquina e itens T4/T5

Status: **proposta, aguardando revisão**.

Nomes de itens novos em inglês. Tiers conforme `DESIGN.md`.
As categorias mais simples do Overworld (minérios, mobs comuns, oceano, tesouros, flora)
vêm nos próximos catálogos.

## A assinatura do Overworld

- **O sol** = só o Overworld tem sol e ciclo de dia e noite.
- **Vida** = poções (regeneração), maçãs, esmeraldas dos aldeões.
- **O mar** = prismarinho, água, conchas.

## O portão do Overworld: Sunstone e o Solar Crucible

- **Sunstone Ore** (minério novo): veios raros **no topo das montanhas** (picos pedregosos e
  irregulares, bem alto). **Só a picareta de diamante minera.** Pedra-do-sol é um mineral real,
  laranja e cintilante, e aparece onde o sol bate mais forte.
- **Raw Sunstone** → triturado/lavado → **Sunstone** → **Solar Casing**.
- **Solar Crucible** (máquina do Overworld): construída com Solar Casing.
  - Recurso do mundo: **luz do sol**. Uma lente no topo concentra o sol num cadinho.
  - Só funciona **de dia** e com **céu aberto** acima (nenhum bloco em cima).
  - A rotação move a lente para acompanhar o sol. Quanto mais alto o sol, mais rápido processa:
    perto do meio-dia é o máximo, ao amanhecer e entardecer é lento, à noite para.
    Chuva deixa mais lento e tempestade para tudo.
  - Nenhuma receita exige um horário específico: o sol só muda a velocidade.
  - Mesmo slot de catalisador das outras máquinas.
  - Os óculos do engenheiro mostram a intensidade do sol e a receita em andamento.
- Diferença das outras: a Soul Forge **coleta** (almas), a Rift Chamber depende de **onde**
  (vazio), a Echo Chamber de **como você isola** (silêncio), e o Solar Crucible de **quando**
  (o ciclo do dia). Uma fábrica com ele tem um ritmo: produz de dia, acumula de noite.

## Receitas

### Totem of Undying (Totem da Imortalidade) · T5
*Evocadores (mansões e invasões). Muito útil.*
1. **Compactador aquecido:** 4 Gold Ingot + 1 Emerald → **Golden Effigy** (item novo)
   - A estatueta de ouro dos illagers.
2. **Montagem sequencial** (base: Golden Effigy, 4 loops):
   1. Implantador: Emerald (a magia dos illagers)
   2. Implantador: Rabbit's Foot (o amuleto da sorte)
   3. Bica: 250 mB de **Potion of Healing** (o "DNA" da vida)
   4. Prensa
   - Resultado: **Dormant Totem** (item novo) · 100%
3. **Solar Crucible** com um **Totem of Undying como catalisador** (não é consumido):
   Dormant Totem → Totem of Undying
- Custo: 4 ouro, 5 esmeraldas, 4 pés de coelho, 1 balde de poção de cura.
- História: uma estatueta recebe a magia dos illagers, a sorte do pé de coelho e a força da vida,
  e o sol a "desperta", copiando o totem original.
- **Automação da poção:** o próprio Create faz poções no misturador sobre bacia aquecida, como fluido:
  água + Nether Wart → Awkward Potion; + Glistering Melon Slice → Potion of Healing. Canos levam a
  poção até a bica. Verruga por colheitadeira mecânica, melancia reluzente pelo crafter mecânico.

### Enchanted Golden Apple (Maçã Dourada Encantada) · T5
*Baús de masmorras, minas e cidades antigas. Muito útil, não renovável no vanilla.*
1. **Montagem sequencial** (base: Golden Apple, 4 loops):
   1. Implantador: Gold Block (homenagem à receita antiga do jogo, que pedia 8 blocos de ouro)
   2. Implantador: Lapis Lazuli (encantamento)
   3. Implantador: Experience Nugget
   4. Prensa
   - Resultado: **Gilded Apple** (item novo) · 100%
2. **Solar Crucible** com uma **Enchanted Golden Apple como catalisador**: Gilded Apple → Enchanted Golden Apple
- Custo: 1 maçã dourada + 4 blocos de ouro + 4 lápis + 4 pepitas de experiência.
- História: a maçã é banhada em ouro e magia, e o sol "abençoa" o brilho do encantamento.

### Heart of the Sea (Coração do Mar) · T4
*Tesouros enterrados. Útil (conduíte).*
1. **Misturador:** 1 Diamond + 4 Prismarine Crystals + 1 Nautilus Shell + 1000 mB de água → **Tide Pearl** (item novo)
2. **Montagem sequencial** (base: Tide Pearl, 3 loops):
   1. Bica: 500 mB de água (a pressão do fundo do mar)
   2. Prensa
   - Resultado: **Abyssal Core** (item novo) · 100%
3. **Solar Crucible:** Abyssal Core → Heart of the Sea
- História: uma pérola nasce de cristais do mar, é comprimida pela pressão da água, e o sol
  (que ilumina o mar onde os tesouros ficam enterrados) cristaliza o coração.
- Depende de: Nautilus Shell (catálogo do Oceano).

### Trident (Tridente) · T4
*Afogados. Útil (arma, Riptide, Channeling).*
1. **Crafter mecânico** no formato de um tridente: 3 Prismarine Shard (pontas) + 2 Diamond
   + 2 Iron Sheet (cabo) → **Trident Blank** (item novo)
2. **Lavagem** (ventilador atrás de água): Trident Blank → **Drowned Trident Blank** (item novo)
   - Ele "se afoga", como os zumbis que viram afogados.
3. **Solar Crucible** com um **Trident como catalisador**: Drowned Trident Blank → Trident
- História: uma arma forjada de prismarinho, afogada como um afogado, e despertada copiando um tridente real.

## Itens novos desta categoria

| Item | Uso |
|---|---|
| Sunstone Ore | minério do Overworld (picos das montanhas), só picareta de diamante minera |
| Raw Sunstone, Sunstone | material do portão do Overworld |
| Solar Casing | carcaça das máquinas do Overworld |
| Solar Crucible | máquina especial do Overworld |
| Golden Effigy, Dormant Totem | intermediários do Totem |
| Gilded Apple | intermediário da Enchanted Golden Apple |
| Tide Pearl, Abyssal Core | intermediários do Heart of the Sea |
| Trident Blank, Drowned Trident Blank | intermediários do Trident |
