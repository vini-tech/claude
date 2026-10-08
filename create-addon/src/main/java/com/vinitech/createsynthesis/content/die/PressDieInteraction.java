package com.vinitech.createsynthesis.content.die;

import com.simibubi.create.content.kinetics.press.MechanicalPressBlockEntity;

import net.fabricmc.fabric.api.event.player.UseBlockCallback;
import net.minecraft.sounds.SoundEvents;
import net.minecraft.sounds.SoundSource;
import net.minecraft.world.InteractionHand;
import net.minecraft.world.InteractionResult;
import net.minecraft.world.item.ItemStack;

/** Click a press with a die to fit it; sneak and click with an empty hand to take it out. No GUI. */
public final class PressDieInteraction {
	private PressDieInteraction() {}

	public static void register() {
		UseBlockCallback.EVENT.register((player, level, hand, hit) -> {
			if (player.isSpectator()
				|| !(level.getBlockEntity(hit.getBlockPos()) instanceof MechanicalPressBlockEntity press)
				|| !(press instanceof DieHolder holder))
				return InteractionResult.PASS;

			ItemStack held = player.getItemInHand(hand);
			ItemStack fitted = holder.create_synthesis$getDie();

			if (held.getItem() instanceof PressDieItem && fitted.isEmpty()) {
				if (!level.isClientSide) {
					holder.create_synthesis$setDie(held.copyWithCount(1));
					if (!player.getAbilities().instabuild)
						held.shrink(1);
					level.playSound(null, hit.getBlockPos(), SoundEvents.ANVIL_PLACE, SoundSource.BLOCKS, .3f, 1.6f);
					press.notifyUpdate();
				}
				return InteractionResult.sidedSuccess(level.isClientSide);
			}

			if (held.isEmpty() && hand == InteractionHand.MAIN_HAND && player.isShiftKeyDown() && !fitted.isEmpty()) {
				if (!level.isClientSide) {
					player.getInventory().placeItemBackInInventory(fitted);
					holder.create_synthesis$setDie(ItemStack.EMPTY);
					level.playSound(null, hit.getBlockPos(), SoundEvents.ITEM_PICKUP, SoundSource.BLOCKS, .3f, 1f);
					press.notifyUpdate();
				}
				return InteractionResult.sidedSuccess(level.isClientSide);
			}

			return InteractionResult.PASS;
		});
	}
}
