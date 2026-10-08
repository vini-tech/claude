package com.vinitech.createsynthesis.content.feed;

import java.util.Map;

import org.jetbrains.annotations.Nullable;

import net.minecraft.core.particles.ParticleTypes;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.sounds.SoundEvents;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.entity.Mob;
import net.minecraft.world.entity.animal.AbstractFish;
import net.minecraft.world.entity.animal.Animal;
import net.minecraft.world.item.Item;
import net.minecraft.world.item.Items;

/**
 * Fattening with Animal Feed and Fish Feed: up to 3 levels, each one a little bigger and one more piece of
 * meat (or fish) when the mob dies. Feed never breeds animals; vanilla food still does that.
 */
public final class Fattening {
	public static final int MAX = 3;

	private Fattening() {}

	private static final Map<EntityType<?>, Item[]> MEAT = Map.of(
		EntityType.COW, new Item[] {Items.BEEF, Items.COOKED_BEEF},
		EntityType.MOOSHROOM, new Item[] {Items.BEEF, Items.COOKED_BEEF},
		EntityType.PIG, new Item[] {Items.PORKCHOP, Items.COOKED_PORKCHOP},
		EntityType.SHEEP, new Item[] {Items.MUTTON, Items.COOKED_MUTTON},
		EntityType.CHICKEN, new Item[] {Items.CHICKEN, Items.COOKED_CHICKEN},
		EntityType.RABBIT, new Item[] {Items.RABBIT, Items.COOKED_RABBIT},
		EntityType.COD, new Item[] {Items.COD, Items.COOKED_COD},
		EntityType.SALMON, new Item[] {Items.SALMON, Items.COOKED_SALMON},
		EntityType.PUFFERFISH, new Item[] {Items.PUFFERFISH, Items.PUFFERFISH},
		EntityType.TROPICAL_FISH, new Item[] {Items.TROPICAL_FISH, Items.TROPICAL_FISH});

	/** The extra drop for each level of fatness; cooked if the mob died on fire, like vanilla meat. */
	@Nullable
	public static Item meatOf(LivingEntity entity) {
		Item[] meat = MEAT.get(entity.getType());
		return meat == null ? null : meat[entity.isOnFire() ? 1 : 0];
	}

	public static int fatness(LivingEntity entity) {
		return entity instanceof Fattenable f ? f.create_synthesis$getFatness() : 0;
	}

	public static boolean eatsAnimalFeed(LivingEntity entity) {
		return entity instanceof Animal && MEAT.containsKey(entity.getType());
	}

	public static boolean eatsFishFeed(LivingEntity entity) {
		return entity instanceof AbstractFish && MEAT.containsKey(entity.getType());
	}

	public static boolean canFatten(LivingEntity entity) {
		return MEAT.containsKey(entity.getType()) && !entity.isBaby() && fatness(entity) < MAX;
	}

	/** One meal: one level fatter, with a little feedback. Returns false if the mob can't eat any more. */
	public static boolean feed(Mob mob) {
		if (!canFatten(mob) || !(mob instanceof Fattenable f))
			return false;
		f.create_synthesis$setFatness(f.create_synthesis$getFatness() + 1);
		mob.playSound(SoundEvents.GENERIC_EAT, .6f, .8f + mob.getRandom().nextFloat() * .4f);
		if (mob.level() instanceof ServerLevel level)
			level.sendParticles(ParticleTypes.HAPPY_VILLAGER, mob.getX(), mob.getY() + mob.getBbHeight() * .8, mob.getZ(),
				6, mob.getBbWidth() * .4, .2, mob.getBbWidth() * .4, 0);
		return true;
	}

	/** How much bigger a mob is drawn: 7% per level. */
	public static float renderScale(LivingEntity entity) {
		return 1 + .07f * fatness(entity);
	}
}
