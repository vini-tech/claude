plugins {
    alias(libs.plugins.loom)
}

val modId = property("mod_id") as String
val mcVer: String = libs.versions.minecraft.get()

version = "${property("mod_version")}+mc$mcVer"
group = property("maven_group") as String
base.archivesName = modId

repositories {
    // cada repositório só fornece os grupos listados, para o Gradle não procurar tudo em todo lugar
    fun mavenProviding(url: String, vararg groups: String) {
        exclusiveContent {
            forRepositories(maven(url)).filter {
                for (group in groups) {
                    includeGroupAndSubgroups(group)
                }
            }
        }
    }

    mavenProviding("https://maven.parchmentmc.org", "org.parchmentmc.data")
    // Create, Registrate, Milk Lib
    mavenProviding("https://mvn.devos.one/snapshots", "com.simibubi.create", "com.tterrag.registrate_fabric", "io.github.tropheusj")
    // Porting Lib
    mavenProviding("https://mvn.devos.one/releases", "io.github.fabricators_of_create.Porting-Lib")
    // Flywheel, Ponder
    mavenProviding("https://maven.createmod.net", "net.createmod", "dev.engine-room")
    mavenProviding("https://raw.githubusercontent.com/Fuzss/modresources/main/maven", "fuzs.forgeconfigapiport")
    mavenProviding("https://maven.jamieswhiteshirt.com/libs-release", "com.jamieswhiteshirt")
    mavenProviding("https://maven.terraformersmc.com", "com.terraformersmc", "dev.emi")
}

dependencies {
    minecraft(libs.minecraft)
    mappings(loom.layered {
        officialMojangMappings { nameSyntheticMembers = false }
        parchment(libs.parchment)
    })
    modImplementation(libs.fabric.loader)
    modImplementation(libs.fabric.api)

    // Create — o resto (Flywheel, Ponder, Registrate, Porting Lib...) vem junto automaticamente
    modImplementation(libs.create)

    // só no ambiente de teste: visualizador de receitas e menu de mods
    modLocalRuntime(libs.emi)
    modLocalRuntime(libs.modmenu)
}

java {
    withSourcesJar()
}

tasks.withType<JavaCompile>().configureEach {
    // Minecraft 1.20.1 roda em Java 17
    options.release = 17
    options.encoding = "UTF-8"
}

loom {
    runs {
        register("datagen") {
            client()
            name("Data Generation")
            vmArg("-Dfabric-api.datagen")
            vmArg("-Dfabric-api.datagen.output-dir=${file("src/generated/resources")}")
            vmArg("-Dfabric-api.datagen.modid=$modId")
            vmArg("-Dporting_lib.datagen.existing_resources=${file("src/main/resources")}")
        }
    }
}

sourceSets.main {
    resources {
        srcDir("src/generated/resources")
        exclude(".cache/")
    }
}

tasks.processResources {
    val properties = mapOf(
        "version" to version,
        "minecraft_version" to mcVer,
        "loader_version" to libs.versions.fabric.loader.get(),
        "fabric_version" to libs.versions.fabric.api.get(),
        "create_version" to libs.versions.create.get().substringBefore("+"),
    )
    inputs.properties(properties)
    filesMatching("fabric.mod.json") {
        expand(properties)
    }
}
