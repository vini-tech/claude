# Create: Synthesis — Design Brief

Mod id: `create_synthesis` · Minecraft 1.20.1 · Fabric · Create 6.0.8.1

## Goal

Give every survival-obtainable item that has no crafting recipe a creative,
thematic production route built on Create's machines.

## Scope

- **In:** every item obtainable in survival that cannot be crafted:
  mob drops, loot-only items, natural blocks, etc.
- **Out:** items impossible to get in survival (bedrock, end portal frame,
  spawn eggs, command blocks, barrier, ...).
- **Skip:** items that Create or vanilla can already produce with machines
  (e.g. sand from crushing gravel). No duplicate routes.

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

## New content

- New intermediate materials (and possibly fluids) are welcome.
- A **few** new machines, only for the most special recipes. Don't overdo it.

## Art

Final (not placeholder) textures and models, closely matching Create's own
style and palette, inspired by Create and its addons, but original.

## Project conventions

- Everything in English: code, assets, lang keys, docs, commit messages.
  `en_us` is the primary language; `pt_br` is kept as a translation.
- Polish: reasonably good-looking, publishable later without rework.

## Workflow

1. Build the full list of non-craftable survival items from game data
   (all items minus recipe outputs from vanilla + Create).
2. Present a recipe catalog **one category at a time** for review.
3. Implement only approved categories.
