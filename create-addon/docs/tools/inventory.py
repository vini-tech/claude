import json, os, sys, glob, collections
S = sys.argv[1]
reg = json.load(open(f"{S}/mcdata/out/reports/registries.json"))
items = sorted(reg["minecraft:item"]["entries"].keys())
lang = json.load(open(f"{S}/vanilla/assets/minecraft/lang/en_us.json"))
clang = json.load(open(f"{S}/createjar/assets/create/lang/en_us.json"))

def name(i):
    ns, p = i.split(":")
    for k in (f"item.{ns}.{p}", f"block.{ns}.{p}"):
        if k in lang: return lang[k]
        if k in clang: return clang[k]
    return p

def outs(obj):
    r = []
    def it(x):
        if isinstance(x, str): r.append(x)
        elif isinstance(x, dict):
            if "item" in x: r.append(x["item"])
            elif "id" in x: r.append(x["id"])
    if "result" in obj:
        res = obj["result"]
        if isinstance(res, list): [it(x) for x in res]
        else: it(res)
    for x in obj.get("results", []): it(x)
    return r

produced = collections.defaultdict(set)   # item -> set of recipe types
def scan(files, source):
    for f in files:
        try: j = json.load(open(f))
        except Exception: continue
        conds = json.dumps(j.get("fabric:load_conditions", []))
        if "mod_loaded" in conds or "all_mods_loaded" in conds or "any_mod_loaded" in conds:
            continue  # compat recipes for other mods
        t = j.get("type", "?")
        for o in outs(j):
            produced[o].add(f"{source}:{t.split(':')[-1]}")
        # sequenced assembly: also counts
scan(glob.glob(f"{S}/mcdata/out/data/minecraft/recipes/*.json"), "vanilla")
scan(glob.glob(f"{S}/createjar/data/create/recipes/**/*.json", recursive=True), "create")
scan(glob.glob(f"{S}/createjar/data/minecraft/recipes/**/*.json", recursive=True), "create")

# special (code) crafting recipes in vanilla
for i in ["minecraft:firework_rocket","minecraft:firework_star","minecraft:tipped_arrow","minecraft:filled_map","minecraft:written_book","minecraft:suspicious_stew"]:
    produced[i].add("vanilla:special")

# create items too
citems = sorted(set(k.split(".",2)[2] for k in clang if k.count(".")==2 and k.split(".")[0] in ("item","block")))
all_items = items + ["create:"+c for c in citems if "create:"+c not in items]

non = [i for i in all_items if i not in produced and i != "minecraft:air"]
out = {"craftable_by_anything": len(all_items)-len(non), "non_craftable": [{"id": i, "name": name(i)} for i in non]}
json.dump(out, open(f"{S}/noncraftable.json","w"), indent=1)
# also items only produced by create machines (not vanilla crafting) -> "already covered by create"
cov = {i: sorted(t) for i,t in produced.items() if all(x.startswith("create:") for x in t) and i.startswith("minecraft:")}
json.dump(cov, open(f"{S}/create_covered.json","w"), indent=1)
print(len(all_items), "items;", len(non), "non-craftable;", len(cov), "vanilla items produced only by Create machines")
