package com.vinitech.createsynthesis.content.feed;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.WeakHashMap;

import org.jetbrains.annotations.Nullable;

import net.minecraft.core.BlockPos;
import net.minecraft.world.level.Level;

/** The loaded Feeding Troughs of each world, so animals find one without scanning blocks around them. */
public final class Troughs {
	private static final Map<Level, Set<BlockPos>> LOADED = new WeakHashMap<>();

	private Troughs() {}

	static void add(Level level, BlockPos pos) {
		LOADED.computeIfAbsent(level, l -> new HashSet<>()).add(pos.immutable());
	}

	static void remove(Level level, BlockPos pos) {
		Set<BlockPos> set = LOADED.get(level);
		if (set != null)
			set.remove(pos);
	}

	@Nullable
	private static FeedingTroughBlockEntity at(Level level, BlockPos pos) {
		return level.getBlockEntity(pos) instanceof FeedingTroughBlockEntity trough ? trough : null;
	}

	public static boolean hasFeed(Level level, BlockPos pos) {
		FeedingTroughBlockEntity trough = at(level, pos);
		return trough != null && trough.feedCount() > 0;
	}

	public static boolean takeOne(Level level, BlockPos pos) {
		FeedingTroughBlockEntity trough = at(level, pos);
		return trough != null && trough.takeOne();
	}

	@Nullable
	public static BlockPos nearestWithFeed(Level level, BlockPos from, double range) {
		Set<BlockPos> set = LOADED.get(level);
		if (set == null)
			return null;
		BlockPos best = null;
		double bestDistance = range * range;
		for (BlockPos pos : set) {
			double distance = pos.distSqr(from);
			if (distance <= bestDistance && hasFeed(level, pos)) {
				best = pos;
				bestDistance = distance;
			}
		}
		return best;
	}
}
