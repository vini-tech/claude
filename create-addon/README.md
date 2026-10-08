# Create: Synthesis

An addon for [Create](https://github.com/Fabricators-of-Create/create) on Fabric that gives every
item without a crafting recipe a thematic production route built on Create's machines.

| | Version |
|---|---|
| Minecraft | 1.20.1 |
| Create Fabric | 6.0.8.1 (build 1744) |
| Fabric Loader | 0.17.2 |
| Fabric API | 0.92.6+1.20.1 |
| Fabric Loom | 1.10 |
| Gradle | 9.1.0 (wrapper) |
| Java | JDK 17 or 21 |

Dependency versions live in `gradle/libs.versions.toml` and match the ones Create Fabric itself is built with.

## Development

1. Install JDK 21 (e.g. [Temurin](https://adoptium.net)) and IntelliJ IDEA.
2. Open this folder in IntelliJ as a Gradle project. The first sync downloads Minecraft, Create and their libraries.
3. Useful tasks (`gradlew.bat` on Windows):

| Command | What it does |
|---|---|
| `./gradlew runClient` | launches Minecraft with Create and this addon |
| `./gradlew runServer` | launches a dedicated test server |
| `./gradlew build` | builds the mod into `build/libs/create_synthesis-<version>.jar` |
| `python3 tools/datagen.py` | regenerates recipes, transitional item models, lang and tags into `src/generated/resources` |

To play outside the dev environment, put the built jar in your `mods` folder together with
Create Fabric 6.0.8.1 and Fabric API.

## Layout

```
src/main/java/com/vinitech/createsynthesis/
  CreateSynthesis.java          common entrypoint; owns the REGISTRATE
  CreateSynthesisClient.java    client-only entrypoint (rendering, Ponder)
  registry/                     items, blocks, creative tab
src/main/resources/
  fabric.mod.json
  assets/create_synthesis/      textures, models, lang
  data/create_synthesis/        hand-written data (loot tables, etc.)
src/generated/resources/        output of tools/datagen.py (do not edit by hand)
tools/datagen.py                recipe definitions; edit here and re-run
```

## License

MIT
