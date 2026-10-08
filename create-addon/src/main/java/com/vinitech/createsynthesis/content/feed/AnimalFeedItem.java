package com.vinitech.createsynthesis.content.feed;

import net.minecraft.world.InteractionHand;
import net.minecraft.world.InteractionResult;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.entity.Mob;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.item.Item;
import net.minecraft.world.item.ItemStack;

/** Fed to a land animal by hand or by a Deployer (which uses items on mobs like a player). */
public class AnimalFeedItem extends Item {
	public AnimalFeedItem(Properties properties) {
		super(properties);
	}

	@Override
	public InteractionResult interactLivingEntity(ItemStack stack, Player player, LivingEntity target, InteractionHand hand) {
		if (!Fattening.eatsAnimalFeed(target) || !Fattening.canFatten(target) || !(target instanceof Mob mob))
			return InteractionResult.PASS;
		if (!player.level().isClientSide) {
			Fattening.feed(mob);
			if (!player.getAbilities().instabuild)
				stack.shrink(1);
		}
		return InteractionResult.sidedSuccess(player.level().isClientSide);
	}
}
