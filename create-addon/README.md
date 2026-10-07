# Create Addon

Add-on para o mod [Create](https://github.com/Fabricators-of-Create/create) no Fabric.

| | Versão |
|---|---|
| Minecraft | 1.20.1 |
| Create Fabric | 6.0.8.1 (build 1744) |
| Fabric Loader | 0.17.2 |
| Fabric API | 0.92.6+1.20.1 |
| Fabric Loom | 1.10 |
| Gradle | 9.1.0 (wrapper) |
| Java | JDK 17 ou 21 |

As versões ficam em `gradle/libs.versions.toml` e são as mesmas que o próprio Create Fabric usa.

## Como rodar no seu computador

1. Instale o JDK 21 (Temurin: https://adoptium.net) e o IntelliJ IDEA Community.
2. Clone o repositório e abra a pasta `create-addon/` no IntelliJ (como projeto Gradle).
3. Na primeira vez o Gradle baixa o Minecraft, o Create e as bibliotecas. Isso leva alguns minutos.
4. Comandos (no terminal, dentro de `create-addon/`):

| Comando | O que faz |
|---|---|
| `./gradlew runClient` | abre o Minecraft com o Create e o add-on |
| `./gradlew runServer` | sobe um servidor de teste |
| `./gradlew build` | gera o mod em `build/libs/createaddon-<versão>.jar` |
| `./gradlew runDatagen` | gera JSONs (modelos, lang, receitas) em `src/generated/resources` |

No Windows, use `gradlew.bat` no lugar de `./gradlew`.

Para jogar com o mod fora do ambiente de desenvolvimento, coloque o `.jar` gerado na pasta `mods`, junto com o Create Fabric 6.0.8.1 e o Fabric API.

## Estrutura

```
src/main/java/com/vinitech/createaddon/
  CreateAddon.java          ponto de entrada; cria o REGISTRATE (registrador no estilo do Create)
  CreateAddonClient.java    código só do cliente (renderização, Ponder)
  registry/
    AddonCreativeTabs.java  aba do modo criativo
    AddonItems.java         itens
src/main/resources/
  fabric.mod.json           metadados e dependências do mod
  assets/createaddon/       texturas, modelos, traduções (en_us, pt_br)
  data/createaddon/         receitas, tags, loot tables
```

O item `example_alloy` e a receita `example_alloy_mixing.json` (latão + cobre no misturador aquecido) são só um exemplo para confirmar que tudo funciona. Podem ser apagados.

## Trocar o nome do mod

O nome provisório é `createaddon`. Para trocar, substitua `createaddon` em todo o projeto (inclusive nos nomes das pastas `assets/createaddon`, `data/createaddon` e no pacote Java) e ajuste `name` no `fabric.mod.json`.
