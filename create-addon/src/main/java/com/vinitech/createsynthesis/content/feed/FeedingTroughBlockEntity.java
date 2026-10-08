package com.vinitech.createsynthesis.content.feed;

import com.vinitech.createsynthesis.registry.SynthesisBlocks;
import com.vinitech.createsynthesis.registry.SynthesisItems;

import net.fabricmc.fabric.api.transfer.v1.item.ItemVariant;
import net.fabricmc.fabric.api.transfer.v1.item.base.SingleStackStorage;
import net.minecraft.core.BlockPos;
import net.minecraft.nbt.CompoundTag;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.block.entity.BlockEntity;
import net.minecraft.world.level.block.state.BlockState;

/** Holds up to a stack of Animal Feed. Hands, funnels, chutes and belts put feed in; only animals take it out. */
@SuppressWarnings("UnstableApiUsage")
public class FeedingTroughBlockEntity extends BlockEntity {
	public static final int CAPACITY = 64;
	private ItemStack feed = ItemStack.EMPTY;

	public final SingleStackStorage storage = new SingleStackStorage() {
		@Override
		protected ItemStack getStack() {
			return feed;
		}

		@Override
		protected void setStack(ItemStack stack) {
			feed = stack;
		}

		@Override
		protected boolean canInsert(ItemVariant variant) {
			return variant.isOf(SynthesisItems.ANIMAL_FEED.get());
		}

		@Override
		protected boolean canExtract(ItemVariant variant) {
			return false;
		}

		@Override
		protected int getCapacity(ItemVariant variant) {
			return CAPACITY;
		}

		@Override
		protected void onFinalCommit() {
			changed();
		}
	};

	public FeedingTroughBlockEntity(BlockPos pos, BlockState state) {
		super(SynthesisBlocks.FEEDING_TROUGH_ENTITY, pos, state);
	}

	public int feedCount() {
		return feed.getCount();
	}

	public ItemStack feed() {
		return feed;
	}

	/** Puts as much of the stack in as fits; returns how many went in. */
	public int insert(ItemStack stack) {
		if (!stack.is(SynthesisItems.ANIMAL_FEED.get()))
			return 0;
		int amount = Math.min(stack.getCount(), CAPACITY - feed.getCount());
		if (amount <= 0)
			return 0;
		feed = feed.isEmpty() ? stack.copyWithCount(amount) : feed.copyWithCount(feed.getCount() + amount);
		changed();
		return amount;
	}

	public boolean takeOne() {
		if (feed.isEmpty())
			return false;
		feed.shrink(1);
		changed();
		return true;
	}

	private void changed() {
		setChanged();
		if (level != null && !level.isClientSide) {
			BlockState state = getBlockState();
			int fill = FeedingTroughBlock.fillFor(feed.getCount());
			if (state.getValue(FeedingTroughBlock.FEED) != fill)
				level.setBlock(worldPosition, state.setValue(FeedingTroughBlock.FEED, fill), 3);
		}
	}

	@Override
	public void setLevel(Level level) {
		super.setLevel(level);
		if (!level.isClientSide)
			Troughs.add(level, worldPosition);
	}

	@Override
	public void setRemoved() {
		super.setRemoved();
		if (level != null && !level.isClientSide)
			Troughs.remove(level, worldPosition);
	}

	@Override
	public void clearRemoved() {
		super.clearRemoved();
		if (level != null && !level.isClientSide)
			Troughs.add(level, worldPosition);
	}

	@Override
	protected void saveAdditional(CompoundTag tag) {
		super.saveAdditional(tag);
		if (!feed.isEmpty())
			tag.put("Feed", feed.save(new CompoundTag()));
	}

	@Override
	public void load(CompoundTag tag) {
		super.load(tag);
		feed = tag.contains("Feed") ? ItemStack.of(tag.getCompound("Feed")) : ItemStack.EMPTY;
	}
}
