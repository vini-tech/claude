package com.vinitech.createsynthesis.registry;

import com.simibubi.create.foundation.item.ItemDescription;
import com.simibubi.create.foundation.item.TooltipModifier;
import com.vinitech.createsynthesis.CreateSynthesis;
import com.vinitech.createsynthesis.content.feed.FeedingTroughBlock;
import com.vinitech.createsynthesis.content.feed.FeedingTroughBlockEntity;

import net.createmod.catnip.lang.FontHelper;
import net.fabricmc.fabric.api.itemgroup.v1.ItemGroupEvents;
import net.fabricmc.fabric.api.object.builder.v1.block.entity.FabricBlockEntityTypeBuilder;
import net.fabricmc.fabric.api.transfer.v1.item.ItemStorage;
import net.minecraft.core.Registry;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.world.item.BlockItem;
import net.minecraft.world.item.Item;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.entity.BlockEntityType;
import net.minecraft.world.level.block.state.BlockBehaviour;

@SuppressWarnings("UnstableApiUsage")
public class SynthesisBlocks {
	public static final FeedingTroughBlock FEEDING_TROUGH = Registry.register(BuiltInRegistries.BLOCK,
		CreateSynthesis.asResource("feeding_trough"),
		new FeedingTroughBlock(BlockBehaviour.Properties.copy(Blocks.SPRUCE_PLANKS).noOcclusion()));

	public static final Item FEEDING_TROUGH_ITEM = Registry.register(BuiltInRegistries.ITEM,
		CreateSynthesis.asResource("feeding_trough"), new BlockItem(FEEDING_TROUGH, new Item.Properties()));

	public static final BlockEntityType<FeedingTroughBlockEntity> FEEDING_TROUGH_ENTITY = Registry.register(
		BuiltInRegistries.BLOCK_ENTITY_TYPE, CreateSynthesis.asResource("feeding_trough"),
		FabricBlockEntityTypeBuilder.create(FeedingTroughBlockEntity::new, FEEDING_TROUGH).build());

	public static void register() {
		// funnels, chutes and belts fill the trough through Fabric's transfer API
		ItemStorage.SIDED.registerForBlockEntity((trough, side) -> trough.storage, FEEDING_TROUGH_ENTITY);
		ItemGroupEvents.modifyEntriesEvent(SynthesisCreativeTabs.MAIN_KEY).register(entries -> entries.accept(FEEDING_TROUGH_ITEM));
		// Create-style description (Registrate does this for the items it registers)
		TooltipModifier.REGISTRY.register(FEEDING_TROUGH_ITEM,
			new ItemDescription.Modifier(FEEDING_TROUGH_ITEM, FontHelper.Palette.STANDARD_CREATE));
	}
}
