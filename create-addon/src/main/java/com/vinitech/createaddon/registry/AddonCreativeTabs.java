package com.vinitech.createaddon.registry;

import com.simibubi.create.AllBlocks;
import com.vinitech.createaddon.CreateAddon;

import net.fabricmc.fabric.api.itemgroup.v1.FabricItemGroup;
import net.minecraft.core.Registry;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.core.registries.Registries;
import net.minecraft.network.chat.Component;
import net.minecraft.resources.ResourceKey;
import net.minecraft.world.item.CreativeModeTab;

public class AddonCreativeTabs {
	public static final ResourceKey<CreativeModeTab> MAIN_KEY =
		ResourceKey.create(Registries.CREATIVE_MODE_TAB, CreateAddon.asResource("main"));

	public static final CreativeModeTab MAIN = Registry.register(BuiltInRegistries.CREATIVE_MODE_TAB, MAIN_KEY,
		FabricItemGroup.builder()
			.title(Component.translatable("itemGroup.createaddon.main"))
			.icon(() -> AllBlocks.COGWHEEL.asStack())
			.build());

	public static void register() {
		// tudo registrado pelo REGISTRATE daqui em diante vai para esta aba
		CreateAddon.REGISTRATE.setCreativeTab(MAIN_KEY);
		CreateAddon.REGISTRATE.defaultCreativeTab(MAIN_KEY);
	}
}
