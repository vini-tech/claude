package com.vinitech.createsynthesis.registry;

import com.vinitech.createsynthesis.CreateSynthesis;
import com.vinitech.createsynthesis.content.feed.EatFlakeGoal;
import com.vinitech.createsynthesis.content.feed.EatFromTroughGoal;
import com.vinitech.createsynthesis.content.feed.Fattening;
import com.vinitech.createsynthesis.content.feed.FeedFlakeEntity;
import com.vinitech.createsynthesis.mixin.MobAccessor;

import net.fabricmc.fabric.api.event.lifecycle.v1.ServerEntityEvents;
import net.fabricmc.fabric.api.object.builder.v1.entity.FabricEntityTypeBuilder;
import net.minecraft.core.Registry;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.world.entity.EntityDimensions;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.MobCategory;
import net.minecraft.world.entity.animal.AbstractFish;
import net.minecraft.world.entity.animal.Animal;

public class SynthesisEntities {
	public static final EntityType<FeedFlakeEntity> FEED_FLAKE = Registry.register(BuiltInRegistries.ENTITY_TYPE,
		CreateSynthesis.asResource("feed_flake"),
		FabricEntityTypeBuilder.<FeedFlakeEntity>create(MobCategory.MISC, FeedFlakeEntity::new)
			.dimensions(EntityDimensions.fixed(.15f, .15f))
			.trackRangeBlocks(24)
			.trackedUpdateRate(5)
			.build());

	public static void register() {
		// animals learn to use feeding troughs, fish learn to eat feed flakes
		ServerEntityEvents.ENTITY_LOAD.register((entity, level) -> {
			if (entity instanceof Animal animal && Fattening.eatsAnimalFeed(animal))
				((MobAccessor) animal).create_synthesis$getGoalSelector().addGoal(4, new EatFromTroughGoal(animal));
			else if (entity instanceof AbstractFish fish && Fattening.eatsFishFeed(fish))
				((MobAccessor) fish).create_synthesis$getGoalSelector().addGoal(3, new EatFlakeGoal(fish));
		});
	}
}
