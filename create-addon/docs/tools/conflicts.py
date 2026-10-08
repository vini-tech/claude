"""Procura conflitos entre as receitas do Create: Synthesis e as do vanilla/Create.

Reproduz as regras do Create 6 (Fabric) para a bacia:
- Prensa sobre bacia: receitas create:compacting + receitas de crafting com 4 ou 9 ingredientes iguais.
- Misturador: receitas create:mixing + crafting sem forma (shapeless) com mais de 1 ingrediente
  que não sejam "compactáveis".
- Quando várias receitas servem, o Create escolhe a que tem MAIS ingredientes de item (fluidos não contam).
- Receitas de crafting ignoram o calor; receitas do Create exigem o calor pedido
  (sem exigência = funciona com qualquer calor).

Também compara as receitas de entrada única (prensa na esteira, moedor, triturador, serra, ventilador,
bica, implantador, lixa) e o primeiro passo de cada montagem sequencial.

Por padrão simula as regras que o mod adiciona (BasinRecipeRules): bacia aquecida não automatiza
crafting, e as nossas receitas vão primeiro quando estão completas. `--create-puro` desliga as regras.

Níveis: SEMPRE/EMPATE = conflito mesmo com os ingredientes na proporção certa (precisa corrigir);
"bacia aquecida" = a nossa só toma o lugar da outra se a bacia estiver aquecida;
"sobras" = a outra só roda quando sobra um ingrediente (entrada desbalanceada).

Uso: python docs/tools/conflicts.py  (lê os jars do cache do Gradle; rode `gradlew build` antes)
"""

import glob
import json
import os
import sys
import zipfile
from collections import defaultdict

RULES = "--create-puro" not in sys.argv
HOME = os.path.expanduser("~")
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OURS = os.path.join(ROOT, "src", "generated", "resources", "data")


def find_jar(pattern):
    hits = [p for p in glob.glob(os.path.join(HOME, ".gradle", "caches", pattern), recursive=True)
            if not p.endswith("-sources.jar")]
    if not hits:
        sys.exit(f"jar não encontrado: {pattern}")
    return hits[0]


JARS = [
    find_jar("fabric-loom/1.20.1/minecraft-merged.jar"),
    find_jar("modules-2/files-2.1/com.simibubi.create/create-fabric/6.0.8.1*/*/*.jar"),
    find_jar("modules-2/files-2.1/net.fabricmc.fabric-api/fabric-convention-tags-v1/*/*/*.jar"),
]


def read_jar_data(path):
    out = {}
    with zipfile.ZipFile(path) as z:
        for name in z.namelist():
            if name.startswith("data/") and name.endswith(".json"):
                try:
                    out[name] = json.loads(z.read(name))
                except ValueError:
                    pass
    return out


def read_dir_data(root):
    out = {}
    for path in glob.glob(os.path.join(root, "**", "*.json"), recursive=True):
        rel = "data/" + os.path.relpath(path, root).replace(os.sep, "/")
        with open(path, encoding="utf-8") as f:
            out[rel] = json.load(f)
    return out


def split(name):
    # data/<ns>/<kind>/<path>.json
    parts = name.split("/")
    return parts[1], parts[2], "/".join(parts[3:])[:-5]


# ---------- carregamento ----------
files = {}
for jar in JARS:
    files.update(read_jar_data(jar))
our_files = read_dir_data(OURS)
files.update(our_files)

item_tags = defaultdict(list)
fluid_tags = defaultdict(list)
serializer_tags = defaultdict(list)
for name, data in files.items():
    ns, kind, path = split(name)
    if kind != "tags":
        continue
    sub, _, rest = path.partition("/")
    target = {"items": item_tags, "fluids": fluid_tags, "recipe_serializer": serializer_tags}.get(sub)
    if target is None:
        continue
    for v in data.get("values", []):
        target[f"{ns}:{rest}"].append(v["id"] if isinstance(v, dict) else v)


def resolve(tags, tag, seen=None):
    seen = seen or set()
    if tag in seen:
        return set()
    seen.add(tag)
    out = set()
    for v in tags.get(tag, []):
        if v.startswith("#"):
            out |= resolve(tags, v[1:], seen)
        else:
            out.add(v)
    return out or {"#" + tag}


IGNORED_SERIALIZERS = resolve(serializer_tags, "create:automation_ignore")


def ing_items(ing):
    """Conjunto de itens aceitos por um ingrediente (None se for fluido)."""
    if isinstance(ing, list):
        s = set()
        for i in ing:
            s |= ing_items(i) or set()
        return s
    if "fluid" in ing or "fluidTag" in ing:
        return None
    if "item" in ing:
        return {ing["item"]}
    if "tag" in ing:
        return resolve(item_tags, ing["tag"])
    return set()


def ing_fluids(ing):
    if isinstance(ing, list):
        return None
    if "fluid" in ing:
        f = ing["fluid"]
        return {f, f.replace("flowing_", "")}
    if "fluidTag" in ing:
        return resolve(fluid_tags, ing["fluidTag"])
    return None


MOD_OK = {"minecraft", "create", "fabric", "c", "create_synthesis"}


def loadable(data):
    for cond in data.get("fabric:load_conditions", []):
        if cond.get("condition") == "fabric:all_mods_loaded":
            if any(v not in MOD_OK for v in cond.get("values", [])):
                return False
        if cond.get("condition") == "fabric:not":
            return False
    return True


class Recipe:
    def __init__(self, rid, data, ours):
        self.id = rid
        self.type = data.get("type", "")
        self.ours = ours
        self.heat = data.get("heatRequirement", "none")
        self.items = []   # lista de conjuntos (um por ingrediente de item)
        self.fluids = []  # lista de conjuntos
        self.data = data
        t = self.type
        if t == "minecraft:crafting_shaped":
            key = data.get("key", {})
            for row in data.get("pattern", []):
                for ch in row:
                    if ch != " " and ch in key:
                        self.items.append(frozenset(ing_items(key[ch])))
        else:
            for ing in data.get("ingredients", []) + ([data["ingredient"]] if "ingredient" in data else []):
                f = ing_fluids(ing)
                if f is not None:
                    self.fluids.append(frozenset(f))
                else:
                    self.items.append(frozenset(ing_items(ing)))

    def results(self):
        d = self.data
        r = d.get("results") or ([d["result"]] if "result" in d else [])
        out = []
        for x in r:
            if isinstance(x, str):
                out.append(x)
            elif "item" in x:
                out.append(x["item"] + (f" x{x['count']}" if x.get("count", 1) > 1 else ""))
            elif "fluid" in x:
                out.append(x["fluid"] + " (fluido)")
        return ", ".join(out)


recipes = []
for name, data in files.items():
    ns, kind, path = split(name)
    if kind != "recipes" or not isinstance(data, dict) or not loadable(data):
        continue
    ours = name in our_files
    rid = f"{ns}:{path}"
    if rid.endswith("_manual_only") or data.get("type") in IGNORED_SERIALIZERS:
        continue
    recipes.append(Recipe(rid, data, ours))


def all_same(items):
    return len(items) in (4, 9) and len(set(items)) == 1


def machines(r):
    """Máquinas de bacia onde a receita roda."""
    t = r.type
    if t == "create:compacting":
        return {"press"}
    if t == "create:mixing":
        return {"mixer"}
    if t in ("minecraft:crafting_shaped", "minecraft:crafting_shapeless"):
        if all_same(r.items):
            return {"press"}
        if t == "minecraft:crafting_shapeless" and len(r.items) > 1:
            return {"mixer"}
    return set()


HEAT_RANK = {"none": 0, "heated": 1, "superheated": 2}


def heat_ok(other, basin_heat):
    """A receita `other` roda com o calor que a receita nossa exige?"""
    if other.type.startswith("minecraft:"):
        return True  # crafting ignora o calor
    need = other.heat
    if need == "none":
        return True
    if need == "heated":
        return basin_heat in ("heated", "superheated")
    return basin_heat == "superheated"


def satisfiable(other, items_avail, fluids_avail):
    for s in other.items:
        if not (s & items_avail):
            return False
    for f in other.fluids:
        if not (f & fluids_avail):
            return False
    return True


basin = [(r, m) for r in recipes for m in machines(r)]
found = []
for r, m in basin:
    if not r.ours:
        continue
    avail_items = frozenset().union(*r.items) if r.items else frozenset()
    avail_fluids = frozenset().union(*r.fluids) if r.fluids else frozenset()
    for o, om in basin:
        if o is r or om != m:
            continue
        crafting = o.type.startswith("minecraft:")
        # regra do mod (BasinRecipeRules): bacia aquecida não automatiza receitas de crafting
        if crafting and RULES and r.heat != "none":
            continue
        # 1) outra receita roda com os ingredientes da nossa
        if heat_ok(o, r.heat) and satisfiable(o, avail_items, avail_fluids):
            n_r, n_o = len(r.items), len(o.items)
            if RULES and not o.ours:
                # a nossa vai primeiro quando está completa; a outra só pega sobras
                level = "sobras"
            else:
                level = "SEMPRE" if n_o > n_r else ("EMPATE" if n_o == n_r else "sobras")
            found.append((level, m, r, o, "rouba a nossa"))
        # 2) a nossa roda com os ingredientes de uma receita do vanilla/Create
        if not o.ours:
            o_items = frozenset().union(*o.items) if o.items else frozenset()
            o_fluids = frozenset().union(*o.fluids) if o.fluids else frozenset()
            if satisfiable(r, o_items, o_fluids):
                if RULES:
                    # a nossa vai primeiro; só a exigência de calor a impede
                    if o.heat == "none" and r.heat != "none" and not crafting:
                        found.append(("bacia aquecida", m, r, o, "a nossa rouba"))
                    elif HEAT_RANK[r.heat] <= HEAT_RANK.get(o.heat, 0):
                        found.append(("SEMPRE", m, r, o, "a nossa rouba"))
                elif heat_ok(r, o.heat) and len(r.items) >= len(o.items):
                    level = "SEMPRE" if len(r.items) > len(o.items) else "EMPATE"
                    found.append((level, m, r, o, "a nossa rouba"))

# receitas de entrada única: mesmo tipo + mesmo item de entrada (+ fluido/item segurado)
SINGLE = {"create:pressing", "create:milling", "create:crushing", "create:cutting", "create:splashing",
          "create:haunting", "minecraft:smoking", "minecraft:smelting", "minecraft:blasting",
          "create:filling", "create:deploying", "create:item_application", "create:sandpaper_polishing"}
single = [r for r in recipes if r.type in SINGLE]


def first_step(r):
    """Primeiro passo de uma montagem sequencial, como receita de entrada única."""
    seq = r.data.get("sequence", [])
    if not seq:
        return None
    step = dict(seq[0])
    ings = [r.data["ingredient"]] + step.get("ingredients", [])[1:]
    step["ingredients"] = ings
    s = Recipe(r.id + " (1º passo)", step, r.ours)
    return s


singles = list(single)
for r in recipes:
    if r.type == "create:sequenced_assembly":
        s = first_step(r)
        if s:
            singles.append(s)

FAN_SAME = {"minecraft:smelting": "fan_blast", "minecraft:blasting": "fan_blast"}


def single_key(r):
    t = FAN_SAME.get(r.type, r.type)
    if t == "create:item_application":
        t = "create:deploying"
    return t


for r in singles:
    if not r.ours:
        continue
    for o in singles:
        if o is r or single_key(o) != single_key(r):
            continue
        if len(o.items) != len(r.items) or len(o.fluids) != len(r.fluids):
            continue
        if all(a & b for a, b in zip(r.items, o.items)) and all(a & b for a, b in zip(r.fluids, o.fluids)):
            if o.ours and o.id < r.id:
                continue  # par já listado
            found.append(("EMPATE", single_key(r), r, o, "mesma entrada"))

ORDER = {"SEMPRE": 0, "EMPATE": 1, "bacia aquecida": 2, "sobras": 3}
found.sort(key=lambda x: (ORDER[x[0]], x[1], x[2].id))
for level, m, r, o, how in found:
    print(f"[{level}] {m}: {r.id} -> {r.results()}  |  {how}: {o.id} -> {o.results()}")
print(f"\n{len(found)} conflitos")
