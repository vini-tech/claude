package com.vinitech.createsynthesis.content.feed;

import java.util.EnumSet;

import org.jetbrains.annotations.Nullable;

import net.minecraft.core.BlockPos;
import net.minecraft.world.entity.ai.goal.Goal;
import net.minecraft.world.entity.animal.Animal;

/** An animal walks to a Feeding Trough with feed within 8 blocks and eats one Animal Feed from it. */
public class EatFromTroughGoal extends Goal {
	private static final double RANGE = 8;
	private final Animal animal;
	@Nullable
	private BlockPos trough;
	private int ticks;
	private int cooldown;

	public EatFromTroughGoal(Animal animal) {
		this.animal = animal;
		setFlags(EnumSet.of(Flag.MOVE, Flag.LOOK));
	}

	@Override
	public boolean canUse() {
		if (--cooldown > 0 || !Fattening.canFatten(animal) || animal.isInLove())
			return false;
		cooldown = 40 + animal.getRandom().nextInt(40);
		trough = Troughs.nearestWithFeed(animal.level(), animal.blockPosition(), RANGE);
		return trough != null;
	}

	@Override
	public boolean canContinueToUse() {
		return trough != null && ticks < 200 && Fattening.canFatten(animal) && Troughs.hasFeed(animal.level(), trough);
	}

	@Override
	public void start() {
		ticks = 0;
		moveTo();
	}

	private void moveTo() {
		animal.getNavigation().moveTo(trough.getX() + .5, trough.getY(), trough.getZ() + .5, 1);
	}

	@Override
	public void tick() {
		if (trough == null)
			return;
		ticks++;
		animal.getLookControl().setLookAt(trough.getX() + .5, trough.getY() + .5, trough.getZ() + .5);
		if (animal.distanceToSqr(trough.getX() + .5, trough.getY(), trough.getZ() + .5) < 2.5 * 2.5) {
			if (Troughs.takeOne(animal.level(), trough))
				Fattening.feed(animal);
			trough = null;
		} else if (animal.getNavigation().isDone()) {
			moveTo();
		}
	}

	@Override
	public void stop() {
		trough = null;
		animal.getNavigation().stop();
	}
}
