# Create: Synthesis — Design Brief

Mod id: `create_synthesis` · Minecraft 1.20.1 · Fabric · Create 6.0.8.1

## Goal

Give every survival-obtainable item that has no crafting recipe a creative,
thematic production route built on Create's machines.

**The point is automation, not shortcuts.** A route must never let a player
skip the progression needed to get the item by hand.

## Scope

- **In:** every item obtainable in survival that cannot be crafted:
  mob drops, loot-only items, natural blocks, etc.
- **Out:** items impossible to get in survival (bedrock, end portal frame,
  spawn eggs, command blocks, barrier, ...).
- **Skip:** items that Create or vanilla can already produce with machines
  (e.g. sand from crushing gravel). No duplicate routes.
- **Skip:** bucketed mobs (fish, axolotl, tadpole buckets).
- **Skip:** raw meats and rabbit hide (animal farms are already easy).
  Instead, Create-made **feeds** fatten animals (up to 3 levels, +1 meat per
  level on death), fed by hand, by a Deployer, or via a **Feeding Trough**
  block that animals within ~8 blocks walk to on their own.
  One **Animal Feed** for all land animals. **Fish Feed** for fish (raw fish
  are also skipped): dropped into water it turns into tiny floating feed
  flakes (a small 3D model) that fish swim to and eat, like real fish food.
- **In:** flora that is not trivially farmable: flowers, ground/cave/water
  plants, Nether and End plants.
- **Skip:** wood (logs, leaves, saplings, apples, azaleas) and crops (carrot,
  potato, beetroot, melon, pumpkin, sugar cane, cactus, bamboo, sweet berries,
  cocoa): Create already farms them easily.
- **Dragon egg:** only gets a recipe if it is used as an ingredient or
  catalyst somewhere else in the mod.

## Difficulty

Progressive. Difficulty is driven by **usefulness + rarity**, not rarity alone:

- Rare and useful (elytra, totem of undying, nether star) → among the hardest,
  long sequenced-assembly chains and expensive inputs.
- Rare but low utility (music discs, pottery sherds, trim templates) → moderate.
- Common → cheap.

## Recipe style

- Thematic and logical: each recipe tells a small story.
- Items relate to **their own origin** (dimension, biome, structure, mob),
  not to their category. Blaze rod talks to the Nether/fortress; shulker
  shell talks to the End. Same category ≠ similar recipe.
- Variant families (music discs, trim templates, pottery sherds, mob heads):
  a shared base production line plus a unique final touch tied to each
  variant's theme.
- **Random outputs** where the game itself is random: goat horns get a random
  instrument; common music discs (13, cat, blocks, chirp, far, mall, mellohi,
  stal, strad, ward, 11, wait) come out at random from the Engraving Die.
  Discs with a unique origin keep their own themed recipe: Pigstep (bastion),
  otherside (ancient city), Relic (archaeology). Pottery sherds are random too
  (Sherd Stamp on a press).

- **Be creative even with simple items:** chains of different machines are
  welcome when each step adds to the story (e.g. pluck a chicken with a
  deployer holding shears). Cheap does not mean one boring step.
- Fluids as "DNA" (a fluid that gives the item its property) is a tool for
  some recipes, not a rule for all of them.
- **No basin conflicts:** a press/mixer recipe must not be stolen by (or
  steal) a vanilla or Create recipe made from the same ingredients. Heated
  basins don't automate crafting-table recipes in this mod, and our recipes
  win when complete, so recipes that share ingredients with crafting recipes
  are heated. Check with `docs/tools/conflicts.py`.
- **No duplication loops:** a recipe must never cost less than what Create
  gives back when the output is crushed/milled (e.g. nether gold ore crushes
  into 18 nuggets, so it must cost at least 2 gold ingots).

## Difficulty tiers

| Tier | Meaning |
|---|---|
| T1 | cheap: one machine, no heat |
| T2 | simple: one or two steps, may need heat |
| T3 | intermediate: chain of 2–3 machines, or superheated |
| T4 | advanced: sequenced assembly with loops + inputs from other lines |
| T5 | legendary: top of the tree, several production lines, maybe a special machine |

## Progression gates (T4 and T5)

Every T4/T5 route requires the player to already be at that item's level:

- **Gated machine:** the special machine that performs the key step is built
  from a new ore that can only be mined with the tool tier the item implies
  (e.g. the ancient debris route needs a machine made from an ore that only
  a netherite pickaxe can mine).
- **Specimen catalyst:** where it fits, the route also needs one specimen of
  the item (or what it unlocks) as a non-consumed catalyst: you must have
  obtained it once by hand before you can automate it.

## Dimension machines

One special machine per dimension unlocks that dimension's T4/T5 items.
Rules for every special machine:

- **No GUI, no electricity.** Rotation, blocks in the world, item
  interactions (right-click, funnels, belts) and Engineer's Goggles info only.
- Each one has a **distinctive mechanic** not found in Create, tied to a
  resource drawn from the world around the player, themed on its dimension.
- Built from that dimension's gated ore (mined only with the tool tier the
  gate requires).

### Nether: Soul Forge (gate ore: Cinnabar, netherite pickaxe)

- Infernal Casing furnace with a window showing blue flames; needs rotation
  (speed = processing speed, high stress).
- Fuel is **souls**, carried in a **Soul Sack** item: killing any mob
  (hostile or passive) anywhere while carrying the sack stores its soul.
  Soul value scales with the mob's max health (chicken 1, zombie 2,
  ravager 10, Wither 30). The sack is emptied into the forge by right-click
  or by funnels/belts.
- The forge also **absorbs souls directly** from any mob that dies within
  ~8 blocks of it (soul particles fly into it), so a mob farm built next to
  the forge fuels it fully automatically. Same soul values as the sack.
- Stores up to ~100 souls.
- Items enter from the top and leave below/sideways, like a basin. Each recipe
  costs souls; if souls run out the forge pauses (nothing lost).
- Catalyst slot: right-click with an item (e.g. a Nether Star) to place it,
  floating and visible inside the forge; not consumed; removed by empty hand.
- Goggles show the stored souls.

### End: Rift Chamber (gate ore: Purpurite, netherite pickaxe)

- Works only with **no blocks below it down to the bottom of the world**
  (in practice: built over the End void).
- No fuel and no height requirements: being over the void is the condition.
- Rotation-driven (speed = processing speed); items drop into a visible
  rift below and come back transformed. Same catalyst slot as the Soul Forge.
- Goggles show whether it is over the void and the current recipe.

### Deep Dark: Echo Chamber (gate ore: Dioptase, diamond pickaxe)

- Resource: **silence**. Works only with no noise within ~8 blocks: any
  vanilla vibration plus nearby spinning Create machines count as noise.
- **Wool blocks sound**, as in vanilla, so the chamber must be insulated
  with wool inside a factory. Its own drive shaft does not count as noise.
- Noise pauses processing (nothing lost). Rotation-driven; same catalyst slot.
- Goggles show how many noise sources it hears.
- Lighter gate (diamond) because no Deep Dark item reaches T4/T5; used for
  ancient-city-only items (echo shard, shrieker, Silence template).

### Overworld: Solar Crucible (gate ore: Sunstone, diamond pickaxe)

- Sunstone generates on high mountain peaks.
- Resource: **sunlight**. A lens focuses the sun into a crucible; needs open
  sky and daytime. Rotation turns the lens to track the sun.
- Speed follows the sun's height (fastest near noon, stops at night); rain
  slows it, thunderstorms stop it. No recipe needs a specific time of day.
- Same catalyst slot; goggles show sun intensity and current recipe.

Summary of the four: Soul Forge = what you **collect** (souls); Rift Chamber =
**where** it is (over the void); Echo Chamber = **how you insulate** it
(silence); Solar Crucible = **when** it runs (day cycle).

### Attachments for existing Create machines

For easy but variant-heavy families:

- **Press dies** (stamped items): clicked into a Mechanical Press and
  rendered on it. E.g. Engraving Die (music discs), Sherd Stamp (pottery
  sherds), Template Die (smithing templates).
- **Deployer tips** (carved/applied items): held by a Deployer.
  E.g. Carving Chisel (mob heads), Coral Graft (corals).

## New content

- New intermediate materials (and possibly fluids) are welcome.
- A **few** new machines, only for the most special recipes. Don't overdo it.

## Art

Final (not placeholder) textures and models, closely matching Create's own
style and palette, inspired by Create and its addons, but original.

## Project conventions

- Everything that ships to players is in English: item/block/machine names,
  descriptions, tooltips, Ponder text, README. `en_us` is the primary
  language; `pt_br` is kept as a translation.
- Internal planning (recipe catalogs, discussion) may be in Portuguese.
- Polish: reasonably good-looking, publishable later without rework.

## Workflow

1. Research how Create addons and modpacks design fun recipes; take
   inspiration from their ideas without copying recipes.
2. Build the full list of non-craftable survival items from game data
   (all items minus recipe outputs from vanilla + Create).
3. Present a recipe catalog **one category at a time** for review.
4. Implement only approved categories.
