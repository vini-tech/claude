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
- **In:** all flora (logs, leaves, saplings, flowers, crops, Nether plants).
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

- Fluids as "DNA" (a fluid that gives the item its property) is a tool for
  some recipes, not a rule for all of them.
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
