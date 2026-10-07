package com.vinitech.createsynthesis.registry;

import com.simibubi.create.AllBlocks;
import com.vinitech.createsynthesis.CreateSynthesis;

import net.fabricmc.fabric.api.itemgroup.v1.FabricItemGroup;
import net.minecraft.core.Registry;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.core.registries.Registries;
import net.minecraft.network.chat.Component;
import net.minecraft.resources.ResourceKey;
import net.minecraft.world.item.CreativeModeTab;

public class SynthesisCreativeTabs {
	public static final ResourceKey<CreativeModeTab> MAIN_KEY =
		ResourceKey.create(Registries.CREATIVE_MODE_TAB, CreateSynthesis.asResource("main"));

	public static final CreativeModeTab MAIN = Registry.register(BuiltInRegistries.CREATIVE_MODE_TAB, MAIN_KEY,
		FabricItemGroup.builder()
			.title(Component.translatable("itemGroup.create_synthesis.main"))
			.icon(() -> AllBlocks.COGWHEEL.asStack())
			.build());

	public static void register() {
		// everything registered through REGISTRATE from here on goes into this tab
		CreateSynthesis.REGISTRATE.setCreativeTab(MAIN_KEY);
		CreateSynthesis.REGISTRATE.defaultCreativeTab(MAIN_KEY);
	}
}
