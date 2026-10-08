package com.vinitech.createsynthesis.content.feed;

import java.util.Comparator;
import java.util.EnumSet;

import org.jetbrains.annotations.Nullable;

import net.minecraft.world.entity.ai.goal.Goal;
import net.minecraft.world.entity.animal.AbstractFish;

/** A fish swims to the nearest flake of Fish Feed within 8 blocks and eats it. */
public class EatFlakeGoal extends Goal {
	private static final double RANGE = 8;
	private final AbstractFish fish;
	@Nullable
	private FeedFlakeEntity flake;
	private int cooldown;

	public EatFlakeGoal(AbstractFish fish) {
		this.fish = fish;
		setFlags(EnumSet.of(Flag.MOVE));
	}

	@Override
	public boolean canUse() {
		if (--cooldown > 0 || !Fattening.canFatten(fish))
			return false;
		cooldown = 10;
		flake = fish.level().getEntitiesOfClass(FeedFlakeEntity.class, fish.getBoundingBox().inflate(RANGE)).stream()
			.min(Comparator.comparingDouble(fish::distanceToSqr))
			.orElse(null);
		return flake != null;
	}

	@Override
	public boolean canContinueToUse() {
		return flake != null && flake.isAlive() && Fattening.canFatten(fish) && fish.distanceToSqr(flake) < RANGE * RANGE * 2;
	}

	@Override
	public void start() {
		fish.getNavigation().moveTo(flake, 1.4);
	}

	@Override
	public void tick() {
		if (flake == null)
			return;
		if (fish.distanceToSqr(flake) < 1) {
			flake.discard();
			Fattening.feed(fish);
			flake = null;
		} else if (fish.getNavigation().isDone()) {
			fish.getNavigation().moveTo(flake, 1.4);
		}
	}

	@Override
	public void stop() {
		flake = null;
		fish.getNavigation().stop();
	}
}
