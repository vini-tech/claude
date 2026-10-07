import json, sys, re
S = sys.argv[1]; OUT = sys.argv[2]
data = json.load(open(f"{S}/noncraftable.json"))["non_craftable"]
names = {d["id"]: d["name"] for d in data}
lang = json.load(open(f"{S}/vanilla/assets/minecraft/lang/en_us.json"))
TRIMS = ["coast","dune","eye","host","raiser","rib","sentry","shaper","silence","snout","spire","tide","vex","ward","wayfinder","wild"]
for t in TRIMS + ["netherite_upgrade"]:
    i = f"minecraft:{t}_armor_trim_smithing_template" if t != "netherite_upgrade" else "minecraft:netherite_upgrade_smithing_template"
    names[i] = lang.get(f"item.minecraft.{i.split(':')[1]}", i)
for i in list(names):
    q=i.split(":")[1]
    d=lang.get(f"item.minecraft.{q}.desc")
    if q.startswith("music_disc_") and d: names[i]=f"Music Disc ({d})"
    elif q.endswith("banner_pattern") and d: names[i]=f"Banner Pattern ({d})"
    elif q.endswith("_armor_trim_smithing_template"):
        names[i]=lang.get(f"trim_pattern.minecraft.{q.split('_armor')[0]}", q)+" Smithing Template"
    elif q=="netherite_upgrade_smithing_template": names[i]="Netherite Upgrade Smithing Template"
ids = sorted(names)

def p(i): return i.split(":")[1]
cats = {}
def put(cat, i, note=""): cats.setdefault(cat, []).append((i, note))

EXCL_EXACT = {"debug_stick","barrier","jigsaw","light","structure_block","structure_void","knowledge_book","bedrock",
  "end_portal_frame","reinforced_deepslate","spawner","budding_amethyst","infested_cobblestone","farmland",
  "petrified_oak_slab","player_head","frogspawn","chorus_plant","suspicious_sand","suspicious_gravel","bundle",
  "command_block_minecart"}
MECH = {"carved_pumpkin":"tesoura na abóbora","water_bucket":"balde na água","lava_bucket":"balde na lava",
  "milk_bucket":"balde na vaca","powder_snow_bucket":"balde na neve fofa","potion":"alambique","splash_potion":"alambique",
  "lingering_potion":"alambique","enchanted_book":"mesa de encantamento","chipped_anvil":"desgaste da bigorna",
  "damaged_anvil":"desgaste da bigorna","mushroom_stem":"toque suave em cogumelo gigante (cresce com farinha de osso)",
  "brown_mushroom_block":"idem","red_mushroom_block":"idem"}
ORIG = {
 # Nether
 **{k:"Nether" for k in "blaze_rod ghast_tear crimson_nylium crimson_roots crimson_stem warped_nylium warped_roots warped_stem warped_wart_block twisting_vines weeping_vines nether_sprouts shroomlight nether_gold_ore nether_quartz_ore ancient_debris gilded_blackstone crying_obsidian basalt wither_rose wither_skeleton_skull piglin_head piglin_banner_pattern music_disc_pigstep nether_star magma_cube_x".split()},
 # End
 **{k:"End" for k in "shulker_shell chorus_flower chorus_fruit end_stone dragon_breath dragon_head elytra dragon_egg".split()},
 # Deep dark / ancient city
 **{k:"Deep Dark e Cidade Ancestral" for k in "sculk sculk_vein sculk_catalyst sculk_sensor sculk_shrieker echo_shard disc_fragment_5 music_disc_otherside".split()},
 # Ocean
 **{k:"Oceano e água" for k in "heart_of_the_sea nautilus_shell trident wet_sponge scute turtle_egg cod salmon pufferfish tropical_fish cod_bucket salmon_bucket pufferfish_bucket tropical_fish_bucket axolotl_bucket tadpole_bucket ink_sac kelp seagrass sea_pickle lily_pad".split()},
 # Overworld mobs
 **{k:"Mobs do Overworld" for k in "bone feather egg beef chicken mutton porkchop rabbit rabbit_foot rabbit_hide rotten_flesh spider_eye ender_pearl phantom_membrane goat_horn honeycomb bee_nest creeper_head zombie_head skeleton_skull totem_of_undying sniffer_egg".split()},
 # Loot
 **{k:"Tesouros de estruturas" for k in "saddle iron_horse_armor golden_horse_armor diamond_horse_armor chainmail_helmet chainmail_chestplate chainmail_leggings chainmail_boots enchanted_golden_apple bell experience_bottle globe_banner_pattern".split()},
 **{k:"Arqueologia" for k in "torchflower_seeds pitcher_pod".split()},
 # Terrain
 **{k:"Overworld: terreno e minérios" for k in "dirt podzol mycelium moss_block rooted_dirt mangrove_roots cobweb pointed_dripstone glow_lichen hanging_roots snowball coal_ore copper_ore iron_ore gold_ore redstone_ore lapis_ore diamond_ore emerald_ore deepslate_coal_ore deepslate_copper_ore deepslate_iron_ore deepslate_gold_ore deepslate_redstone_ore deepslate_lapis_ore deepslate_diamond_ore deepslate_emerald_ore small_amethyst_bud medium_amethyst_bud large_amethyst_bud amethyst_cluster ochre_froglight pearlescent_froglight verdant_froglight".split()},
}
for i in ids:
    q = p(i)
    if i.startswith("create:"):
        if q in ("zinc_ore","deepslate_zinc_ore"): put("Overworld: terreno e minérios", i)
        else: put("_excl_create", i)
        continue
    if q.endswith("_spawn_egg") or "command_block" in q or q in EXCL_EXACT: put("_excl", i); continue
    if q in MECH: put("_mech", i, MECH[q]); continue
    if q.startswith("stripped_"): put("_mech", i, "machado no tronco (a serra mecânica do Create já faz)"); continue
    if q.endswith("_concrete"): put("_mech", i, "pó de concreto + água"); continue
    if q.endswith("_shulker_box"): put("_mech", i, "tingir caixa de shulker (receita especial do jogo)"); continue
    if q.endswith("_smithing_template"): put("Moldes de ferraria", i); continue
    if q.endswith("_pottery_sherd"): put("Arqueologia", i); continue
    if q.startswith("music_disc_") and q not in ORIG: put("Discos de música", i); continue
    if "coral" in q: put("Oceano e água", i); continue
    if q in ORIG: put(ORIG[q], i); continue
    put("Overworld: flora e cultivo", i)

order = ["Overworld: flora e cultivo","Overworld: terreno e minérios","Mobs do Overworld","Oceano e água",
  "Deep Dark e Cidade Ancestral","Nether","End","Tesouros de estruturas","Arqueologia","Moldes de ferraria","Discos de música"]
tot = sum(len(cats.get(c,[])) for c in order)
L = ["# Inventário: itens sem receita (Minecraft 1.20.1 + Create 6.0.8.1)", "",
 "Gerado a partir dos dados do jogo: todos os itens registrados, menos os que já saem de alguma receita",
 "do vanilla ou do Create (crafting, fornalha, cortador, ferraria e todas as máquinas do Create).",
 "Receitas de duplicação (que pedem o próprio item, como os moldes de ferraria) não contam como produção.", "",
 f"**{tot} itens entram no escopo**, agrupados pela origem no jogo.", ""]
L += ["| Categoria | Itens |", "|---|---|"] + [f"| {c} | {len(cats.get(c,[]))} |" for c in order] + [""]
for c in order:
    L += [f"## {c} ({len(cats[c])})", ""]
    L += [", ".join(f"{names[i]} (`{p(i)}`)" if i.startswith("minecraft:") else f"{names[i]} (`{i}`)" for i,_ in cats[c]), ""]
L += ["## Fora do escopo", "",
 f"### Mecânicas do jogo que já produzem o item ({len(cats['_mech'])})", "",
 "Não têm receita, mas o jogador (ou o Create, com implantadores, bicas e serras) já os produz de forma direta e renovável.", ""]
seen=set()
for i,n in cats["_mech"]:
    L.append(f"- {names[i]} (`{p(i)}`): {n}")
L += ["", f"### Impossíveis no survival ({len(cats['_excl'])})", "",
 "Ovos de spawn, blocos de comando, bedrock, moldura do portal do End, spawner, ametista brotante, areia/cascalho suspeitos, ardósia profunda reforçada, etc.", "",
 ", ".join(f"`{p(i)}`" for i,_ in cats["_excl"]), "",
 f"### Itens técnicos do Create ({len(cats['_excl_create'])})", "",
 "Blocos internos, variantes tingidas (feitas tingindo o item base), itens criativos e materiais legados que não existem mais no Create 6.", "",
 ", ".join(f"`{p(i)}`" for i,_ in cats["_excl_create"]), "",
 "## Já cobertos pelas máquinas do Create (não entram)", "",
 ", ".join(sorted(f"`{p(k)}`" for k in json.load(open(f'{S}/create_covered.json')))), ""]
open(OUT,"w").write("\n".join(L))
print(tot); print({c:len(v) for c,v in cats.items()})
