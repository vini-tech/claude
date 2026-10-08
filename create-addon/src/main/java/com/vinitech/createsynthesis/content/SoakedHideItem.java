package com.vinitech.createsynthesis.content;

import java.util.List;

import org.jetbrains.annotations.Nullable;

import com.vinitech.createsynthesis.CreateSynthesis;

import net.minecraft.ChatFormatting;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.nbt.CompoundTag;
import net.minecraft.network.chat.Component;
import net.minecraft.util.Mth;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.player.Inventory;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.item.Item;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.TooltipFlag;
import net.minecraft.world.level.Level;

/**
 * Leather soaked in tannin. In a player's inventory it dries by itself into Tanned Leather after 5 real minutes;
 * smoking it with an encased fan is the fast way. The drying time is rounded to the minute, so hides soaked
 * around the same time still stack.
 */
public class SoakedHideItem extends Item {
	public static final int DRYING_TICKS = 20 * 60 * 5;
	private static final int ROUND_TO = 20 * 60;
	private static final String DRIES_AT = "DriesAt";

	public SoakedHideItem(Properties properties) {
		super(properties);
	}

	@Override
	public void inventoryTick(ItemStack stack, Level level, Entity entity, int slot, boolean selected) {
		if (level.isClientSide || !(entity instanceof Player player))
			return;
		long now = level.getGameTime();
		CompoundTag tag = stack.getOrCreateTag();
		if (!tag.contains(DRIES_AT)) {
			long driesAt = now + DRYING_TICKS;
			tag.putLong(DRIES_AT, (driesAt + ROUND_TO - 1) / ROUND_TO * ROUND_TO);
			return;
		}
		if (now < tag.getLong(DRIES_AT))
			return;
		Inventory inventory = player.getInventory();
		for (int i = 0; i < inventory.getContainerSize(); i++) {
			if (inventory.getItem(i) == stack) {
				inventory.setItem(i, new ItemStack(tannedLeather(), stack.getCount()));
				return;
			}
		}
	}

	private static Item tannedLeather() {
		return BuiltInRegistries.ITEM.get(CreateSynthesis.asResource("tanned_leather"));
	}

	private static float progress(ItemStack stack) {
		CompoundTag tag = stack.getTag();
		if (tag == null || !tag.contains(DRIES_AT) || CreateSynthesis.clientGameTime() < 0)
			return 0;
		long left = tag.getLong(DRIES_AT) - CreateSynthesis.clientGameTime();
		return Mth.clamp(1 - left / (float) DRYING_TICKS, 0, 1);
	}

	@Override
	public boolean isBarVisible(ItemStack stack) {
		return stack.getTag() != null && stack.getTag().contains(DRIES_AT);
	}

	@Override
	public int getBarWidth(ItemStack stack) {
		return Math.round(13 * progress(stack));
	}

	@Override
	public int getBarColor(ItemStack stack) {
		return Mth.hsvToRgb(.58f - .5f * progress(stack), .6f, .9f); // from wet blue to leather brown
	}

	@Override
	public void appendHoverText(ItemStack stack, @Nullable Level level, List<Component> tooltip, TooltipFlag flag) {
		CompoundTag tag = stack.getTag();
		if (level == null || tag == null || !tag.contains(DRIES_AT))
			return;
		long seconds = Math.max(0, (tag.getLong(DRIES_AT) - level.getGameTime()) / 20);
		tooltip.add(Component.translatable("tooltip.create_synthesis.dries_in",
			String.format("%d:%02d", seconds / 60, seconds % 60)).withStyle(ChatFormatting.GRAY));
	}
}
