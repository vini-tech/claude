package com.vinitech.createsynthesis.content.feed;

import org.jetbrains.annotations.Nullable;

import net.minecraft.core.BlockPos;
import net.minecraft.sounds.SoundEvents;
import net.minecraft.sounds.SoundSource;
import net.minecraft.world.Containers;
import net.minecraft.world.InteractionHand;
import net.minecraft.world.InteractionResult;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.level.BlockGetter;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.block.BaseEntityBlock;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.RenderShape;
import net.minecraft.world.level.block.entity.BlockEntity;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.StateDefinition;
import net.minecraft.world.level.block.state.properties.IntegerProperty;
import net.minecraft.world.phys.BlockHitResult;
import net.minecraft.world.phys.shapes.CollisionContext;
import net.minecraft.world.phys.shapes.Shapes;
import net.minecraft.world.phys.shapes.VoxelShape;

/** A wooden trough for Animal Feed. Animals within 8 blocks walk to it and eat until fully fattened. */
public class FeedingTroughBlock extends BaseEntityBlock {
	/** How full the trough looks: 0 empty .. 3 full. */
	public static final IntegerProperty FEED = IntegerProperty.create("feed", 0, 3);

	private static final VoxelShape SHAPE = Shapes.join(Block.box(0, 0, 0, 16, 10, 16), Block.box(2, 4, 2, 14, 10, 14),
		(a, b) -> a && !b);

	public FeedingTroughBlock(Properties properties) {
		super(properties);
		registerDefaultState(defaultBlockState().setValue(FEED, 0));
	}

	public static int fillFor(int count) {
		if (count <= 0)
			return 0;
		return count <= 21 ? 1 : count <= 42 ? 2 : 3;
	}

	@Override
	protected void createBlockStateDefinition(StateDefinition.Builder<Block, BlockState> builder) {
		builder.add(FEED);
	}

	@Override
	public VoxelShape getShape(BlockState state, BlockGetter level, BlockPos pos, CollisionContext context) {
		return SHAPE;
	}

	@Override
	public RenderShape getRenderShape(BlockState state) {
		return RenderShape.MODEL;
	}

	@Nullable
	@Override
	public BlockEntity newBlockEntity(BlockPos pos, BlockState state) {
		return new FeedingTroughBlockEntity(pos, state);
	}

	@Override
	public InteractionResult use(BlockState state, Level level, BlockPos pos, Player player, InteractionHand hand,
		BlockHitResult hit) {
		ItemStack held = player.getItemInHand(hand);
		if (!(level.getBlockEntity(pos) instanceof FeedingTroughBlockEntity trough) || held.isEmpty())
			return InteractionResult.PASS;
		if (level.isClientSide)
			return InteractionResult.SUCCESS;
		int added = trough.insert(held);
		if (added == 0)
			return InteractionResult.PASS;
		if (!player.getAbilities().instabuild)
			held.shrink(added);
		level.playSound(null, pos, SoundEvents.COMPOSTER_FILL, SoundSource.BLOCKS, .8f, 1);
		return InteractionResult.CONSUME;
	}

	@Override
	public void onRemove(BlockState state, Level level, BlockPos pos, BlockState newState, boolean moved) {
		if (!state.is(newState.getBlock()) && level.getBlockEntity(pos) instanceof FeedingTroughBlockEntity trough)
			Containers.dropItemStack(level, pos.getX(), pos.getY(), pos.getZ(), trough.feed().copy());
		super.onRemove(state, level, pos, newState, moved);
	}
}
