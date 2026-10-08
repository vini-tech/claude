#!/usr/bin/env python3
"""Generates Create: Synthesis recipes, item models, lang and tags.

Run from the create-addon folder:  python3 tools/datagen.py
Output goes to src/generated/resources (wiped and rewritten on every run).

Fluid amounts are written in mB here and converted to Fabric droplets (81 per mB).
"""
import json
import shutil
from pathlib import Path

MOD = "create_synthesis"
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src/generated/resources"
JAVA_INCOMPLETE = ROOT / "src/main/java/com/vinitech/createsynthesis/registry/SynthesisIncompleteItems.java"
JAVA_MATERIALS = ROOT / "src/main/java/com/vinitech/createsynthesis/registry/SynthesisMaterials.java"

recipes = {}       # path -> json
incomplete = {}    # item name -> (english name, model parent or texture)
tags = {}          # (registry, name) -> list of entries
lang_en = {"itemGroup.create_synthesis.main": "Create: Synthesis"}
lang_pt = {"itemGroup.create_synthesis.main": "Create: Synthesis"}


# ---------------------------------------------------------------- helpers

def mc(name):
    return name if ":" in name else f"minecraft:{name}"


def ing(x):
    """'item', '#tag', or a fluid dict from fluid()."""
    if isinstance(x, dict):
        return x
    if x.startswith("#"):
        return {"tag": mc(x[1:])}
    return {"item": mc(x)}


def fluid(name, mb):
    return {"fluid": mc(name), "amount": mb * 81, "nbt": {}}


def water(mb):
    return fluid("water", mb)


def lava(mb):
    return fluid("lava", mb)


def out(item, count=1, chance=None):
    r = {"item": mc(item)}
    if count != 1:
        r["count"] = count
    if chance is not None:
        r["chance"] = chance
    return r


def fluid_out(name, mb):
    return {"fluid": mc(name), "amount": mb * 81}


def results(rs):
    return [r if isinstance(r, dict) else out(r) for r in rs]


def add(category, name, data):
    recipes[f"{category}/{name}"] = data


def processing(kind, category, name, ingredients, rs, heat=None, time=None, keep_held=False):
    data = {"type": f"create:{kind}", "ingredients": [ing(i) for i in ingredients], "results": results(rs)}
    if heat:
        data["heatRequirement"] = heat
    if time:
        data["processingTime"] = time
    if keep_held:
        data["keepHeldItem"] = True
    add(category, name, data)


def mixing(cat, name, ingredients, rs, heat=None):
    processing("mixing", cat, name, ingredients, rs, heat)


def compacting(cat, name, ingredients, rs, heat=None):
    processing("compacting", cat, name, ingredients, rs, heat)


def deploying(cat, name, target, held, rs, keep=False):
    processing("deploying", cat, name, [target, held], rs, keep_held=keep)


def filling(cat, name, target, fl, rs):
    processing("filling", cat, name, [target, fl], rs)


def single(kind, cat, name, inp, rs, time=None):
    processing(kind, cat, name, [inp], rs, time=time)


def register_incomplete(name, english, model):
    """model: ('texture', 'minecraft:item/x') or ('parent', 'minecraft:block/x')."""
    incomplete[name] = (english, model)
    lang_en[f"item.{MOD}.{name}"] = english


def sequenced(cat, name, base, steps, loops, result, transitional, english, model, scrap=None):
    """steps: list of ('deploy', item) | ('fill', fluid) | ('press',) | ('cut',)."""
    t = f"{MOD}:{transitional}"
    register_incomplete(transitional, english, model)
    seq = []
    for step in steps:
        kind = step[0]
        if kind == "deploy":
            seq.append({"type": "create:deploying", "ingredients": [{"item": t}, ing(step[1])], "results": [{"item": t}]})
        elif kind == "fill":
            seq.append({"type": "create:filling", "ingredients": [{"item": t}, step[1]], "results": [{"item": t}]})
        elif kind == "press":
            seq.append({"type": "create:pressing", "ingredients": [{"item": t}], "results": [{"item": t}]})
        elif kind == "cut":
            seq.append({"type": "create:cutting", "ingredients": [{"item": t}], "results": [{"item": t}], "processingTime": 50})
        else:
            raise ValueError(kind)
    rs = [result if isinstance(result, dict) else out(result)]
    if scrap:
        rs = [dict(rs[0], chance=scrap[0])] + [out(i, chance=w) for i, w in scrap[1]]
    add(cat, name, {"type": "create:sequenced_assembly", "ingredient": ing(base), "loops": loops,
                    "transitionalItem": {"item": t}, "results": rs, "sequence": seq})


def shaped(cat, name, pattern, key, result, count=1):
    r = {"item": mc(result)}
    if count != 1:
        r["count"] = count
    add(cat, name, {"type": "minecraft:crafting_shaped", "pattern": pattern,
                    "key": {k: ing(v) for k, v in key.items()}, "result": r})


def tag(registry, name, values):
    tags[(registry, name)] = values


# ---------------------------------------------------------------- 01 Nether

mixing("nether", "crying_obsidian", ["obsidian", "amethyst_shard", water(100)], ["crying_obsidian"], heat="heated")
mixing("nether", "ghast_tear", ["crying_obsidian", "soul_sand", "soul_sand", "soul_sand", "soul_sand"],
       ["ghast_tear", "obsidian", out("soul_soil", 4)], heat="heated")
mixing("nether", "blaze_rod", ["glowstone_dust", "glowstone_dust", "create:cinder_flour", "create:cinder_flour", lava(250)],
       ["blaze_rod"], heat="superheated")
compacting("nether", "basalt", ["soul_soil", "ice", lava(250)], [out("basalt", 2)])
compacting("nether", "nether_gold_ore", ["netherrack", "gold_ingot", "gold_ingot"], ["nether_gold_ore"])
compacting("nether", "nether_quartz_ore", ["netherrack", "quartz", "quartz", "quartz"], ["nether_quartz_ore"])
sequenced("nether", "gilded_blackstone", "blackstone", [("deploy", "gold_ingot")], 2, "gilded_blackstone",
          "incomplete_gilded_blackstone", "Incomplete Gilded Blackstone", ("parent", "minecraft:block/gilded_blackstone"))
deploying("nether", "piglin_banner_pattern", "paper", "gilded_blackstone", ["piglin_banner_pattern"], keep=True)
compacting("nether", "shroomlight", ["crimson_fungus", "bone_meal", "bone_meal", "bone_meal", "glowstone_dust"],
           ["shroomlight", "nether_wart_block"])
compacting("nether", "warped_wart_block", ["warped_fungus", "bone_meal", "bone_meal", "bone_meal"], [out("warped_wart_block", 2)])
deploying("nether", "crimson_nylium", "netherrack", "crimson_fungus", ["crimson_nylium"], keep=True)
deploying("nether", "warped_nylium", "netherrack", "warped_fungus", ["warped_nylium"], keep=True)
deploying("nether", "crimson_roots", "crimson_nylium", "bone_meal",
          ["crimson_nylium", out("crimson_roots", 2), out("weeping_vines", chance=0.25)])
deploying("nether", "warped_roots", "warped_nylium", "bone_meal",
          ["warped_nylium", out("warped_roots", 2), "nether_sprouts", out("twisting_vines", chance=0.25)])
deploying("nether", "wither_rose", "poppy", "wither_skeleton_skull", ["wither_rose"], keep=True)

# ---------------------------------------------------------------- 02 End

compacting("end", "end_stone", ["sandstone"] * 4 + ["popped_chorus_fruit"], [out("end_stone", 4)])
deploying("end", "chorus_fruit", "end_stone", "chorus_flower",
          ["end_stone", out("chorus_fruit", 2), out("chorus_flower", chance=0.1)], keep=True)
compacting("end", "ender_pearl", ["popped_chorus_fruit"] * 8 + ["amethyst_shard"], ["ender_pearl"], heat="heated")
mixing("end", "dragon_breath", ["glass_bottle", "popped_chorus_fruit", "popped_chorus_fruit", "blaze_powder"],
       ["dragon_breath"], heat="superheated")

# ---------------------------------------------------------------- 03 Deep Dark

deploying("deep_dark", "sculk", "deepslate", "create:experience_nugget", ["sculk"])
single("cutting", "deep_dark", "sculk_vein", "sculk", [out("sculk_vein", 3)], time=50)
sequenced("deep_dark", "sculk_sensor", "sculk", [("deploy", "redstone"), ("deploy", "string"), ("press",)], 1,
          "sculk_sensor", "incomplete_sculk_sensor", "Incomplete Sculk Sensor", ("parent", "minecraft:block/sculk_sensor_inactive"))
mixing("deep_dark", "sculk_catalyst", ["bone_block"] + ["sculk"] * 4 + ["create:experience_nugget"] * 5, ["sculk_catalyst"])

# ---------------------------------------------------------------- 05 Overworld ores and terrain

ORES = [  # ore, host, material, amount
    ("coal_ore", "stone", "coal", 2), ("deepslate_coal_ore", "deepslate", "coal", 3),
    ("copper_ore", "stone", "raw_copper", 6), ("deepslate_copper_ore", "deepslate", "raw_copper", 8),
    ("iron_ore", "stone", "raw_iron", 2), ("deepslate_iron_ore", "deepslate", "raw_iron", 3),
    ("gold_ore", "stone", "raw_gold", 2), ("deepslate_gold_ore", "deepslate", "raw_gold", 3),
    ("redstone_ore", "stone", "redstone", 7), ("deepslate_redstone_ore", "deepslate", "redstone", 8),
    ("lapis_ore", "stone", "lapis_lazuli", 11), ("deepslate_lapis_ore", "deepslate", "lapis_lazuli", 13),
    ("diamond_ore", "stone", "diamond", 2), ("deepslate_diamond_ore", "deepslate", "diamond", 3),
    ("emerald_ore", "stone", "emerald", 2), ("deepslate_emerald_ore", "deepslate", "emerald", 3),
    ("create:zinc_ore", "stone", "create:raw_zinc", 2), ("create:deepslate_zinc_ore", "deepslate", "create:raw_zinc", 3),
]
for ore, host, material, n in ORES:
    compacting("ores", ore.split(":")[-1], [host] + [material] * n, [ore])

AMETHYST = [("amethyst_shard", "small_amethyst_bud", "Growing Small Amethyst Bud"),
            ("small_amethyst_bud", "medium_amethyst_bud", "Growing Medium Amethyst Bud"),
            ("medium_amethyst_bud", "large_amethyst_bud", "Growing Large Amethyst Bud"),
            ("large_amethyst_bud", "amethyst_cluster", "Growing Amethyst Cluster")]
for base, result, english in AMETHYST:
    sequenced("terrain", result, base, [("deploy", "amethyst_shard"), ("fill", water(250))], 1, result,
              f"growing_{result}", english, ("texture", f"minecraft:block/{result}"))

mixing("terrain", "dirt", ["gravel", "gravel", "bone_meal", water(100)], [out("dirt", 2)])
deploying("terrain", "podzol", "dirt", "spruce_leaves", ["podzol"])
deploying("terrain", "mycelium", "dirt", "brown_mushroom", ["mycelium"])
deploying("terrain", "rooted_dirt", "dirt", "azalea", ["rooted_dirt"])
deploying("terrain", "mangrove_roots", "mud", "mangrove_propagule", ["mangrove_roots"])
deploying("terrain", "moss_block", "moss_block", "bone_meal", [out("moss_block", 2)])
deploying("terrain", "hanging_roots", "rooted_dirt", "bone_meal", ["rooted_dirt", "hanging_roots"])
mixing("terrain", "glow_lichen", ["moss_carpet", "moss_carpet", "glow_ink_sac"], [out("glow_lichen", 4)])
filling("terrain", "pointed_dripstone", "calcite", water(100), ["pointed_dripstone"])
compacting("terrain", "cobweb", ["string"] * 4 + ["slime_ball"], ["cobweb"])
single("milling", "terrain", "snowball", "ice", [out("snowball", 2)], time=100)
for light, touch in [("ochre_froglight", "lily_pad"), ("pearlescent_froglight", "mud"), ("verdant_froglight", "snowball")]:
    mixing("terrain", light, ["magma_cream", "magma_cream", touch], [light])

# ---------------------------------------------------------------- 06 Overworld mobs

deploying("mobs", "feather", "chicken", "shears", [out("feather", 3)])  # the shears wear down
sequenced("mobs", "rabbit_foot", "rabbit_hide", [("deploy", "golden_carrot"), ("deploy", "string"), ("press",)], 1,
          "rabbit_foot", "incomplete_rabbit_foot", "Incomplete Rabbit's Foot", ("texture", "minecraft:item/rabbit_foot"))
tag("items", "raw_meats", ["minecraft:beef", "minecraft:porkchop", "minecraft:mutton", "minecraft:chicken", "minecraft:rabbit"])
lang_en[f"tag.item.{MOD}.raw_meats"] = "Raw Meats"  # tag names shown by EMI
lang_pt[f"tag.item.{MOD}.raw_meats"] = "Carnes Cruas"
single("haunting", "mobs", "rotten_flesh", f"#{MOD}:raw_meats", [out("rotten_flesh", 2)])
mixing("mobs", "spider_eye", ["poisonous_potato", "sweet_berries", "string"], ["spider_eye"])
mixing("mobs", "honey", ["sugar", "sugar", "sugar", "#small_flowers", water(250)], [fluid_out("create:honey", 250)], heat="heated")
compacting("mobs", "honeycomb", [fluid("create:honey", 250)], ["honeycomb"], heat="heated")
for log in ["oak_log", "birch_log"]:
    sequenced("mobs", f"bee_nest_from_{log}", log, [("deploy", "honeycomb"), ("deploy", "honeycomb"), ("cut",)], 1,
              "bee_nest", f"incomplete_bee_nest_{log.split('_')[0]}", "Incomplete Bee Nest", ("parent", "minecraft:item/bee_nest"))
sequenced("mobs", "sniffer_egg", "egg",
          [("deploy", "torchflower_seeds"), ("deploy", "pitcher_pod"), ("deploy", "moss_block"), ("fill", water(250))], 1,
          "sniffer_egg", "incomplete_sniffer_egg", "Incomplete Sniffer Egg", ("texture", "minecraft:item/egg"),
          scrap=(90, [("moss_block", 10)]))

# ---------------------------------------------------------------- 07 Ocean

mixing("ocean", "kelp", ["kelp", "bone_meal", water(500)], [out("kelp", 3)])
mixing("ocean", "seagrass", ["sand", "bone_meal", water(250)], ["sand", out("seagrass", 2)])
mixing("ocean", "sea_pickle", ["kelp", "glowstone_dust", water(250)], ["sea_pickle"])
mixing("ocean", "ink_sac", ["coal", "coal", "kelp", water(250)], ["ink_sac"])
mixing("ocean", "turtle_egg", ["egg", "seagrass", "seagrass", "sand"], ["turtle_egg"])
sequenced("ocean", "scute", "turtle_egg", [("deploy", "seagrass"), ("fill", water(250)), ("press",)], 2,
          "scute", "incomplete_scute", "Hatching Turtle Egg", ("texture", "minecraft:item/turtle_egg"))
sequenced("ocean", "wet_sponge", "hay_block", [("deploy", "prismarine_crystals"), ("deploy", "kelp"), ("fill", water(500))], 2,
          "wet_sponge", "incomplete_wet_sponge", "Soaking Sponge", ("parent", "minecraft:block/wet_sponge"))
for coral in ["tube", "brain", "bubble", "fire", "horn"]:
    for form in ["coral", "coral_fan", "coral_block"]:
        add("ocean", f"dead_{coral}_{form}_from_smoking",
            {"type": "minecraft:smoking", "ingredient": {"item": f"minecraft:{coral}_{form}"},
             "result": f"minecraft:dead_{coral}_{form}", "experience": 0.0, "cookingtime": 100})

# ---------------------------------------------------------------- 08 Treasures

for metal, sheet in [("iron", "create:iron_sheet"), ("golden", "create:golden_sheet")]:
    sequenced("treasures", f"{metal}_horse_armor", "leather_horse_armor", [("deploy", sheet), ("press",)], 4,
              f"{metal}_horse_armor", f"incomplete_{metal}_horse_armor", f"Incomplete {metal.title()} Horse Armor",
              ("texture", f"minecraft:item/{metal}_horse_armor"))
sequenced("treasures", "diamond_horse_armor", "iron_horse_armor", [("deploy", "diamond"), ("press",)], 4,
          "diamond_horse_armor", "incomplete_diamond_horse_armor", "Incomplete Diamond Horse Armor",
          ("texture", "minecraft:item/diamond_horse_armor"))
for piece, base, loops in [("helmet", "leather_helmet", 5), ("chestplate", "leather_chestplate", 8),
                           ("leggings", "leather_leggings", 7), ("boots", "leather_boots", 4)]:
    sequenced("treasures", f"chainmail_{piece}", base, [("deploy", "chain"), ("press",)], loops, f"chainmail_{piece}",
              f"incomplete_chainmail_{piece}", f"Incomplete Chainmail {piece.title()}",
              ("texture", f"minecraft:item/chainmail_{piece}"))
deploying("treasures", "globe_banner_pattern", "paper", "map", ["globe_banner_pattern"], keep=True)

# ---------------------------------------------------------------- 12 Flora

FLOWERS = ["allium", "azure_bluet", "blue_orchid", "cornflower", "dandelion", "lily_of_the_valley", "orange_tulip",
           "pink_tulip", "red_tulip", "white_tulip", "oxeye_daisy", "poppy", "pink_petals", "lilac", "peony",
           "rose_bush", "sunflower"]
for f in FLOWERS:
    mixing("flora", f, [f, "bone_meal", fluid("create:honey", 100)], [out(f, 3)])
mixing("flora", "torchflower", ["torchflower_seeds", "bone_meal", water(250)], ["torchflower"])
mixing("flora", "pitcher_plant", ["pitcher_pod", "bone_meal", water(250)], ["pitcher_plant"])
deploying("flora", "grass", "grass_block", "bone_meal", ["grass_block", out("grass", 2), out("fern", chance=0.25)])
deploying("flora", "tall_grass", "grass", "bone_meal", ["tall_grass"])
deploying("flora", "large_fern", "fern", "bone_meal", ["large_fern"])
deploying("flora", "mushrooms", "mycelium", "bone_meal",
          ["mycelium", out("brown_mushroom", chance=0.5), out("red_mushroom", chance=0.5)])
deploying("flora", "vine", "jungle_leaves", "shears", ["jungle_leaves", out("vine", 2)])  # the shears wear down
mixing("flora", "small_dripleaf", ["small_dripleaf", "clay_ball", "bone_meal", water(250)], [out("small_dripleaf", 2)])
deploying("flora", "big_dripleaf", "small_dripleaf", "bone_meal", ["big_dripleaf"])
mixing("flora", "spore_blossom", ["pink_petals", "moss_block", "glow_berries", water(250)], ["spore_blossom"])
single("pressing", "flora", "lily_pad", "big_dripleaf", [out("lily_pad", 2)])

# ---------------------------------------------------------------- Phase 2: new intermediate items

def material(name, english, portuguese, plain=True):
    """An item of this mod, with its texture at assets/<mod>/textures/item/<name>.png.

    plain=False: the item has its own class in Java (SynthesisItems), so it stays out of SynthesisMaterials.
    """
    materials[name] = (english, portuguese, plain)
    lang_en[f"item.{MOD}.{name}"] = english
    lang_pt[f"item.{MOD}.{name}"] = portuguese
    return f"{MOD}:{name}"


materials = {}  # item name -> (english, portuguese, plain)
PT_EXTRA = {}  # pt_br names of transitional items made in loops

FODDER = material("fodder", "Fodder", "Forragem")
ANIMAL_FEED = material("animal_feed", "Animal Feed", "Ração Animal", plain=False)
FISH_FEED = material("fish_feed", "Fish Feed", "Ração de Peixe", plain=False)
FOSSIL_FRAGMENT = material("fossil_fragment", "Fossil Fragment", "Fragmento de Fóssil")
STRETCHED_HIDE = material("stretched_hide", "Stretched Hide", "Couro Esticado")
HOLLOW_HIDE = material("hollow_hide", "Hollow Hide", "Couro Oco")
HORN_BLANK = material("horn_blank", "Horn Blank", "Chifre Bruto")
NACRE = material("nacre", "Nacre", "Madrepérola")
SOAKED_HIDE = material("soaked_hide", "Soaked Hide", "Couro Encharcado", plain=False)
TANNED_LEATHER = material("tanned_leather", "Tanned Leather", "Couro Curtido")
SADDLE_FRAME = material("saddle_frame", "Saddle Frame", "Armação de Sela")
ROUGH_BELL = material("rough_bell", "Rough Bell", "Sino Bruto")
BLANK_DISC = material("blank_disc", "Blank Disc", "Disco Virgem")
POLISHED_BLANK_DISC = material("polished_blank_disc", "Polished Blank Disc", "Disco Virgem Polido")
CLAY_TABLET = material("clay_tablet", "Clay Tablet", "Placa de Argila")
BLANK_SHERD = material("blank_sherd", "Blank Sherd", "Caco Virgem")
ANCIENT_SOIL = material("ancient_soil", "Ancient Soil", "Terra Antiga")
BLANK_TEMPLATE = material("blank_template", "Blank Template", "Molde Virgem")

# 06 Mobs: feeds (Create already mills wheat into flour, so only seeds make fodder)
for seeds in ("wheat_seeds", "beetroot_seeds", "melon_seeds", "pumpkin_seeds"):
    single("milling", "mobs", f"fodder_from_{seeds}", seeds, [FODDER])
mixing("mobs", "animal_feed", [FODDER, FODDER, "carrot", "bone_meal", water(250)], [out(ANIMAL_FEED, 2)])
mixing("mobs", "egg", [ANIMAL_FEED, "bone_meal", water(100)], ["egg"])

# 06 Mobs: bone, through a fossil
sequenced("mobs", "fossil_fragment", "calcite", [("deploy", "cobblestone"), ("fill", water(100)), ("press",)], 2,
          FOSSIL_FRAGMENT, "incomplete_fossil_fragment", "Incomplete Fossil Fragment", ("parent", "minecraft:block/calcite"))
single("crushing", "mobs", "bone", FOSSIL_FRAGMENT, [out("bone", 2), out("bone_meal", chance=0.25)])

# 06 Mobs: phantom membrane (leather stretched, made undead, soaked in "night")
single("pressing", "mobs", "stretched_hide", "leather", [STRETCHED_HIDE])
single("haunting", "mobs", "hollow_hide", STRETCHED_HIDE, [HOLLOW_HIDE])
filling("mobs", "phantom_membrane", HOLLOW_HIDE,
        {"fluid": "create:potion", "amount": 250 * 81, "nbt": {"Potion": "minecraft:night_vision"}}, ["phantom_membrane"])

# 06 Mobs: goat horn (the saw with a random instrument comes with the attachments step)
shaped("mobs", "horn_blank", ["  B", " B ", "C  "], {"B": "bone", "C": "calcite"}, HORN_BLANK)  # a curved horn, calcite at the base

# 07 Ocean
mixing("ocean", "fish_feed", ["kelp", "kelp", FODDER], [out(FISH_FEED, 2)])
shaped("ocean", "nacre", ["CPC"], {"C": "clay_ball", "P": "prismarine_crystals"}, NACRE)  # sea crystal set in clay
compacting("ocean", "nautilus_shell", [NACRE, NACRE, NACRE], ["nautilus_shell"])

# 08 Treasures: saddle (tan, frame, stitch)
shaped("treasures", "soaked_hide", ["O", "L", "W"], {"O": "oak_log", "L": "leather", "W": "water_bucket"}, SOAKED_HIDE)  # bark tannin + water
add("treasures", "tanned_leather_from_smoking",
    {"type": "minecraft:smoking", "ingredient": {"item": SOAKED_HIDE}, "result": TANNED_LEATHER,
     "experience": 0.1, "cookingtime": 100})
shaped("treasures", "saddle_frame", ["LLL", "CLC", "S S"],
       {"L": TANNED_LEATHER, "C": "chain", "S": "create:iron_sheet"}, SADDLE_FRAME)
sequenced("treasures", "saddle", SADDLE_FRAME, [("deploy", "string"), ("deploy", "iron_nugget"), ("press",)], 3,
          "saddle", "incomplete_saddle", "Incomplete Saddle", ("texture", "minecraft:item/saddle"))

# 08 Treasures: bell (cast in clay, then sanded)
compacting("treasures", "rough_bell", ["gold_ingot"] * 3 + ["clay_ball"], [ROUGH_BELL], heat="heated")
single("sandpaper_polishing", "treasures", "bell", ROUGH_BELL, ["bell"])

# 08 Treasures: Bottle o' Enchanting (Experience Essence comes in fifths of a bottle)
ESSENCE = f"{MOD}:experience_essence"
lang_en[f"fluid.{MOD}.experience_essence"] = "Experience Essence"
lang_pt[f"fluid.{MOD}.experience_essence"] = "Essência de Experiência"
mixing("treasures", "experience_essence",
       ["create:experience_nugget", "create:experience_nugget", "lapis_lazuli", "glowstone_dust"],
       [fluid_out(ESSENCE, 50)], heat="superheated")
sequenced("treasures", "experience_bottle", "glass_bottle", [("fill", fluid(ESSENCE, 50))], 5,
          "experience_bottle", "incomplete_experience_bottle", "Filling Bottle o' Enchanting",
          ("texture", "minecraft:item/experience_bottle"))

# 09 Discs: the blank (the Engraving Die comes with the attachments step)
shaped("discs", "blank_disc", ["CSC"], {"C": "coal", "S": "slime_ball"}, BLANK_DISC)
single("sandpaper_polishing", "discs", "polished_blank_disc", BLANK_DISC, [POLISHED_BLANK_DISC])

# 10 Archaeology: the blanks (the Sherd Stamp and the brush come with the attachments step)
single("pressing", "archaeology", "clay_tablet", "clay_ball", [CLAY_TABLET])
add("archaeology", "blank_sherd_from_smelting",
    {"type": "minecraft:smelting", "ingredient": {"item": CLAY_TABLET}, "result": BLANK_SHERD,
     "experience": 0.1, "cookingtime": 200})
mixing("archaeology", "ancient_soil", ["moss_block", "dirt", "bone_meal", water(250)], [ANCIENT_SOIL])

# 11 Smithing templates: the blank (the Template Die comes with the attachments step)
compacting("templates", "blank_template", ["create:iron_sheet"] * 3 + ["diamond"], [BLANK_TEMPLATE], heat="heated")

# ---------------------------------------------------------------- Phase 2: press dies and deployer tips

def tooltip(name, en, pt):
    """Create-style item description: summary, then (condition, behaviour) pairs. _word_ is highlighted."""
    for lang, (summary, *pairs) in ((lang_en, en), (lang_pt, pt)):
        lang[f"item.{MOD}.{name}.tooltip.summary"] = summary
        for i, (condition, behaviour) in enumerate(pairs, 1):
            lang[f"item.{MOD}.{name}.tooltip.condition{i}"] = condition
            lang[f"item.{MOD}.{name}.tooltip.behaviour{i}"] = behaviour


DIE_HOW_EN = ("When clicked on a Mechanical Press",
              "_Fits_ into the press, which then _stamps_ with it instead of pressing. _Sneak_ and click with an "
              "empty hand to take it out.")
DIE_HOW_PT = ("Ao clicar numa Prensa Mecânica",
              "_Encaixa_ na prensa, que passa a _estampar_ com ela em vez de prensar. _Agache_ e clique com a mão "
              "vazia para tirar.")
TIP_HOW_EN = ("When held by a Deployer", "Works like a tool: it _wears down_ with use instead of being used up.")
TIP_HOW_PT = ("Na mão de um Implantador", "Funciona como ferramenta: _desgasta_ com o uso em vez de ser consumido.")

ENGRAVING_DIE = material("engraving_die", "Engraving Die", "Matriz de Gravação", plain=False)
tooltip("engraving_die",
        ("A die that engraves _Polished Blank Discs_: a _random_ disc on a belt, or a _specific_ one over a basin "
         "with the right ingredient.", DIE_HOW_EN),
        ("Uma matriz que grava _Discos Virgens Polidos_: um disco _aleatório_ na esteira, ou um disco _específico_ "
         "sobre a bacia com o ingrediente certo.", DIE_HOW_PT))
SHERD_STAMP = material("sherd_stamp", "Sherd Stamp", "Carimbo de Cacos", plain=False)
tooltip("sherd_stamp",
        ("A stamp that marks _Blank Sherds_ with a _random_ pottery pattern.", DIE_HOW_EN),
        ("Um carimbo que marca _Cacos Virgens_ com um desenho de cerâmica _aleatório_.", DIE_HOW_PT))
TEMPLATE_DIE = material("template_die", "Template Die", "Matriz de Moldes", plain=False)
tooltip("template_die",
        ("A die that stamps _Blank Templates_ into a _random_ armor trim template.", DIE_HOW_EN),
        ("Uma matriz que estampa _Moldes Virgens_ num molde de acabamento _aleatório_.", DIE_HOW_PT))
CARVING_CHISEL = material("carving_chisel", "Carving Chisel", "Cinzel de Entalhe", plain=False)
tooltip("carving_chisel",
        ("A _Deployer_ tip for carving _mob heads_ out of bone.", TIP_HOW_EN),
        ("Uma ponteira de _Implantador_ para esculpir _cabeças de mobs_ em osso.", TIP_HOW_PT))
CORAL_GRAFT = material("coral_graft", "Coral Graft", "Enxerto de Coral", plain=False)
tooltip("coral_graft",
        ("A _Deployer_ tip for taking _coral_ from a living coral block without harming it.", TIP_HOW_EN),
        ("Uma ponteira de _Implantador_ para tirar _coral_ de um bloco de coral vivo sem machucá-lo.", TIP_HOW_PT))

shaped("tools", "engraving_die", [" D ", "BNB"], {"D": "diamond", "B": "create:brass_sheet", "N": "note_block"}, ENGRAVING_DIE)
shaped("tools", "sherd_stamp", [" F ", "BIB"], {"F": "flint", "B": "create:brass_sheet", "I": "create:iron_sheet"}, SHERD_STAMP)
shaped("tools", "template_die", ["BSB"], {"B": "create:brass_sheet", "S": "smithing_table"}, TEMPLATE_DIE)
shaped("tools", "carving_chisel", [" I", "A "], {"I": "iron_ingot", "A": "create:andesite_alloy"}, CARVING_CHISEL)
shaped("tools", "coral_graft", [" N", "B "], {"N": "iron_nugget", "B": "create:brass_sheet"}, CORAL_GRAFT)


def pick_one(items):
    """Results for a random_ recipe: exactly one is picked, weighted by these chances (see RandomResults)."""
    return [dict(out(i), chance=round(1 / len(items), 4)) if isinstance(i, str) else i for i in items]


# 09 Discs: the Engraving Die (path die/<die>/... = needs that die in the press, see PressDies)
COMMON_DISCS = ["13", "cat", "blocks", "chirp", "far", "mall", "mellohi", "stal", "strad", "ward", "11", "wait"]
single("pressing", "die/engraving_die", "random_music_disc", POLISHED_BLANK_DISC,
       pick_one([f"music_disc_{d}" for d in COMMON_DISCS]))
compacting("die/engraving_die", "music_disc_pigstep", [POLISHED_BLANK_DISC, "gilded_blackstone"], ["music_disc_pigstep"])
compacting("die/engraving_die", "music_disc_otherside", [POLISHED_BLANK_DISC, "echo_shard"], ["music_disc_otherside"])
compacting("die/engraving_die", "music_disc_relic", [POLISHED_BLANK_DISC, "#decorated_pot_sherds"], ["music_disc_relic"])
compacting("die/engraving_die", "disc_fragment_5", [POLISHED_BLANK_DISC, "sculk_vein"], [out("disc_fragment_5", 3)])

# 10 Archaeology: the Sherd Stamp, and the brush on Ancient Soil
SHERDS = ["angler", "archer", "arms_up", "blade", "brewer", "burn", "danger", "explorer", "friend", "heart",
          "heartbreak", "howl", "miner", "mourner", "plenty", "prize", "sheaf", "shelter", "skull", "snort"]
single("pressing", "die/sherd_stamp", "random_pottery_sherd", BLANK_SHERD, pick_one([f"{s}_pottery_sherd" for s in SHERDS]))
deploying("archaeology", "random_ancient_seed", ANCIENT_SOIL, "brush",
          [out("torchflower_seeds", chance=0.6), out("pitcher_pod", chance=0.4)])  # the brush wears down

# 11 Smithing templates: the Template Die
TRIMS = ["coast", "dune", "eye", "host", "raiser", "rib", "sentry", "shaper", "snout", "spire", "tide", "vex",
         "ward", "wayfinder", "wild"]
single("pressing", "die/template_die", "random_armor_trim", BLANK_TEMPLATE,
       pick_one([f"{t}_armor_trim_smithing_template" for t in TRIMS]))

# 06 Mobs: goat horn with a random sound, like the ones goats drop
HORNS = ["ponder", "sing", "seek", "feel", "admire", "call", "yearn", "dream"]
single("cutting", "mobs", "random_goat_horn", HORN_BLANK,
       pick_one([{"item": "minecraft:goat_horn", "nbt": {"instrument": f"minecraft:{h}_goat_horn"}} for h in HORNS]))
for r in recipes["mobs/random_goat_horn"]["results"]:
    r["chance"] = round(1 / len(HORNS), 4)

# 06 Mobs: heads carved with the Carving Chisel (it wears down)
deploying("mobs", "skeleton_skull", "bone_block", CARVING_CHISEL, ["skeleton_skull"])
HEADS = {
    "zombie_head": ("rotten_flesh", "rotten_flesh", "Incomplete Zombie Head", "Cabeça de Zumbi Incompleta"),
    "creeper_head": ("gunpowder", "lime_dye", "Incomplete Creeper Head", "Cabeça de Creeper Incompleta"),
    "piglin_head": ("gold_ingot", "crimson_fungus", "Incomplete Piglin Head", "Cabeça de Piglin Incompleta"),
    "dragon_head": ("dragon_breath", "obsidian", "Incomplete Dragon Head", "Cabeça de Dragão Incompleta"),
}
for head, (first, second, en, pt) in HEADS.items():
    sequenced("mobs", head, "skeleton_skull", [("deploy", first), ("deploy", second), ("deploy", CARVING_CHISEL)], 1,
              head, f"incomplete_{head}", en, ("parent", "minecraft:block/bone_block"))
    PT_EXTRA[f"incomplete_{head}"] = pt

# 07 Ocean: corals grown in the mixer, then grafted with the Coral Graft (it wears down)
CORAL_DYES = {"tube": "blue_dye", "brain": "pink_dye", "bubble": "purple_dye", "fire": "red_dye", "horn": "yellow_dye"}
for coral, dye in CORAL_DYES.items():
    mixing("ocean", f"{coral}_coral_block", ["bone_meal"] * 4 + [dye, "sea_pickle", water(1000)],
           [out(f"{coral}_coral_block", 2)])
    deploying("ocean", f"{coral}_coral", f"{coral}_coral_block", CORAL_GRAFT,
              [f"{coral}_coral_block", f"{coral}_coral", out(f"{coral}_coral_fan", chance=0.5)])

# ---------------------------------------------------------------- Phase 2: feeding and drying

tooltip("soaked_hide",
        ("Leather soaked in tannin. _Dries_ into Tanned Leather by itself after _5 minutes_ in your inventory, "
         "or right away when _smoked_ by an Encased Fan.",),
        ("Couro encharcado no tanino. _Seca_ sozinho e vira Couro Curtido depois de _5 minutos_ no inventário, "
         "ou na hora se for _defumado_ por um Ventilador.",))
lang_en["tooltip.create_synthesis.dries_in"] = "Dries in %s"
lang_pt["tooltip.create_synthesis.dries_in"] = "Seca em %s"
tooltip("animal_feed",
        ("_Fattens_ land animals: up to _3 times_, each time a little bigger and _one more piece of meat_ when "
         "they die. It does not breed them.",
         ("When used on an animal", "Feeds it, by hand or with a _Deployer_."),
         ("In a Feeding Trough", "Animals nearby _walk to the trough_ and eat by themselves.")),
        ("_Engorda_ animais terrestres: até _3 vezes_, cada vez um pouco maiores e com _uma carne a mais_ quando "
         "morrem. Não serve para reproduzir.",
         ("Ao usar num animal", "Alimenta, à mão ou com um _Implantador_."),
         ("Num Cocho", "Os animais por perto _vão até o cocho_ e comem sozinhos.")))
tooltip("fish_feed",
        ("_Fattens_ fish: up to _3 times_, each time _one more fish_ when they die.",
         ("When it lands in water", "Breaks up into _flakes_ that fish swim to and eat. One flake feeds one fish.")),
        ("_Engorda_ peixes: até _3 vezes_, cada vez _um peixe a mais_ quando morrem.",
         ("Ao cair na água", "Vira _flocos_ que os peixes vêm comer. Cada floco alimenta um peixe.")))

lang_en[f"block.{MOD}.feeding_trough"] = "Feeding Trough"
lang_pt[f"block.{MOD}.feeding_trough"] = "Cocho"
for lang, text in ((lang_en, ("Holds up to a stack of _Animal Feed_. Animals within _8 blocks_ walk to it and eat "
                              "until they are fully fattened.",
                              ("When filled", "By hand, or by _Funnels_, _Chutes_ and _Belts_."))),
                   (lang_pt, ("Guarda até um pack de _Ração Animal_. Animais a até _8 blocos_ vêm até ele e comem "
                              "até ficarem totalmente engordados.",
                              ("Para encher", "À mão, ou com _Funis_, _Calhas_ e _Esteiras_.")))):
    lang[f"block.{MOD}.feeding_trough.tooltip.summary"] = text[0]
    lang[f"block.{MOD}.feeding_trough.tooltip.condition1"] = text[1][0]
    lang[f"block.{MOD}.feeding_trough.tooltip.behaviour1"] = text[1][1]
lang_en[f"entity.{MOD}.feed_flake"] = "Feed Flake"
lang_pt[f"entity.{MOD}.feed_flake"] = "Floco de Ração"

shaped("tools", "feeding_trough", ["S S", "PPP"], {"S": "create:iron_sheet", "P": "#planks"}, f"{MOD}:feeding_trough")

block_files = {}  # path under assets/ or data/ -> json


def box(frm, to, texture, faces=("north", "south", "east", "west", "up", "down")):
    return {"from": frm, "to": to, "faces": {f: {"texture": texture, "cullface": f} if f == "down" else {"texture": texture}
                                             for f in faces}}


TROUGH_WALLS = [
    box([0, 0, 0], [16, 2, 16], "#wood"),       # floor
    box([0, 2, 0], [16, 8, 2], "#wood"),        # north wall
    box([0, 2, 14], [16, 8, 16], "#wood"),      # south wall
    box([0, 2, 2], [2, 8, 14], "#wood"),        # west wall
    box([14, 2, 2], [16, 8, 14], "#wood"),      # east wall
    box([3, 6, -0.5], [5, 8.5, 16.5], "#band"),   # iron bands around the trough
    box([11, 6, -0.5], [13, 8.5, 16.5], "#band"),
]
for fill, height in ((0, None), (1, 3.5), (2, 5), (3, 6.5)):
    elements = list(TROUGH_WALLS)
    if height:
        elements.append(box([2, 2, 2], [14, height, 14], "#feed", faces=("up",)))
    block_files[f"assets/{MOD}/models/block/feeding_trough_{fill}.json"] = {
        "parent": "minecraft:block/block",
        "textures": {"particle": "minecraft:block/spruce_planks", "wood": "minecraft:block/spruce_planks",
                     "band": "minecraft:block/iron_block", "feed": f"{MOD}:block/feed_surface"},
        "elements": elements}
block_files[f"assets/{MOD}/blockstates/feeding_trough.json"] = {
    "variants": {f"feed={i}": {"model": f"{MOD}:block/feeding_trough_{i}"} for i in range(4)}}
block_files[f"assets/{MOD}/models/item/feeding_trough.json"] = {"parent": f"{MOD}:block/feeding_trough_2"}
block_files[f"data/{MOD}/loot_tables/blocks/feeding_trough.json"] = {
    "type": "minecraft:block",
    "pools": [{"rolls": 1, "entries": [{"type": "minecraft:item", "name": f"{MOD}:feeding_trough"}],
               "conditions": [{"condition": "minecraft:survives_explosion"}]}]}
block_files["data/minecraft/tags/blocks/mineable/axe.json"] = {"replace": False, "values": [f"{MOD}:feeding_trough"]}

# ---------------------------------------------------------------- write

PT = {  # pt_br names for transitional items
    "incomplete_fossil_fragment": "Fragmento de Fóssil Incompleto",
    "incomplete_saddle": "Sela Incompleta",
    "incomplete_experience_bottle": "Frasco de Experiência Enchendo",
    "incomplete_gilded_blackstone": "Pedra-Negra Dourada Incompleta",
    "incomplete_sculk_sensor": "Sensor de Sculk Incompleto",
    "growing_small_amethyst_bud": "Broto Pequeno de Ametista em Crescimento",
    "growing_medium_amethyst_bud": "Broto Médio de Ametista em Crescimento",
    "growing_large_amethyst_bud": "Broto Grande de Ametista em Crescimento",
    "growing_amethyst_cluster": "Aglomerado de Ametista em Crescimento",
    "incomplete_rabbit_foot": "Pé de Coelho Incompleto",
    "incomplete_bee_nest_oak": "Ninho de Abelha Incompleto",
    "incomplete_bee_nest_birch": "Ninho de Abelha Incompleto",
    "incomplete_sniffer_egg": "Ovo de Farejador Incompleto",
    "incomplete_scute": "Ovo de Tartaruga Chocando",
    "incomplete_wet_sponge": "Esponja Encharcando",
    "incomplete_iron_horse_armor": "Armadura de Ferro para Cavalo Incompleta",
    "incomplete_golden_horse_armor": "Armadura de Ouro para Cavalo Incompleta",
    "incomplete_diamond_horse_armor": "Armadura de Diamante para Cavalo Incompleta",
    "incomplete_chainmail_helmet": "Capacete de Malha Incompleto",
    "incomplete_chainmail_chestplate": "Peitoral de Malha Incompleto",
    "incomplete_chainmail_leggings": "Calças de Malha Incompletas",
    "incomplete_chainmail_boots": "Botas de Malha Incompletas",
}


def write(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main():
    if OUT.exists():
        shutil.rmtree(OUT)
    for path, data in recipes.items():
        write(OUT / f"data/{MOD}/recipes/{path}.json", data)
    for (registry, name), values in tags.items():
        write(OUT / f"data/{MOD}/tags/{registry}/{name}.json", {"replace": False, "values": values})
    for name, (_, (kind, ref)) in incomplete.items():
        model = {"parent": "minecraft:item/generated", "textures": {"layer0": ref}} if kind == "texture" else {"parent": ref}
        write(OUT / f"assets/{MOD}/models/item/{name}.json", model)
    for name in materials:
        write(OUT / f"assets/{MOD}/models/item/{name}.json",
              {"parent": "minecraft:item/generated", "textures": {"layer0": f"{MOD}:item/{name}"}})
        texture = ROOT / f"src/main/resources/assets/{MOD}/textures/item/{name}.png"
        if not texture.exists():
            print(f"warning: missing texture {texture.relative_to(ROOT)}")
    for path, data in block_files.items():
        write(OUT / path, data)
    PT.update(PT_EXTRA)
    missing = set(incomplete) - set(PT)
    if missing:
        raise SystemExit(f"missing pt_br names: {sorted(missing)}")
    lang_pt.update({f"item.{MOD}.{k}": v for k, v in PT.items()})
    write(OUT / f"assets/{MOD}/lang/en_us.json", dict(sorted(lang_en.items())))
    write(OUT / f"assets/{MOD}/lang/pt_br.json", dict(sorted(lang_pt.items())))

    names = ",\n".join(f'\t\t"{n}"' for n in sorted(incomplete))
    JAVA_INCOMPLETE.write_text(f"""package com.vinitech.createsynthesis.registry;

// GENERATED by tools/datagen.py, do not edit by hand.
public final class SynthesisIncompleteItems {{
	public static final String[] NAMES = {{
{names}
	}};

	private SynthesisIncompleteItems() {{
	}}
}}
""", encoding="utf-8")
    names = ",\n".join(f'\t\t"{n}"' for n, (_, _, plain) in materials.items() if plain)
    JAVA_MATERIALS.write_text(f"""package com.vinitech.createsynthesis.registry;

// GENERATED by tools/datagen.py, do not edit by hand.
public final class SynthesisMaterials {{
	public static final String[] NAMES = {{
{names}
	}};

	private SynthesisMaterials() {{
	}}
}}
""", encoding="utf-8")
    print(f"{len(recipes)} recipes, {len(materials)} items, {len(incomplete)} transitional items, {len(tags)} tags")


if __name__ == "__main__":
    main()
