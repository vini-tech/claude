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

deploying("mobs", "feather", "chicken", "shears", [out("feather", 3)], keep=True)
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
deploying("flora", "vine", "jungle_leaves", "shears", ["jungle_leaves", out("vine", 2)], keep=True)
mixing("flora", "small_dripleaf", ["small_dripleaf", "clay_ball", "bone_meal", water(250)], [out("small_dripleaf", 2)])
deploying("flora", "big_dripleaf", "small_dripleaf", "bone_meal", ["big_dripleaf"])
mixing("flora", "spore_blossom", ["pink_petals", "moss_block", "glow_berries", water(250)], ["spore_blossom"])
single("pressing", "flora", "lily_pad", "big_dripleaf", [out("lily_pad", 2)])

# ---------------------------------------------------------------- write

PT = {  # pt_br names for transitional items
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
    print(f"{len(recipes)} recipes, {len(incomplete)} transitional items, {len(tags)} tags")


if __name__ == "__main__":
    main()
