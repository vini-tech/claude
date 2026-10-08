package com.vinitech.createsynthesis.mixin;

import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

import com.simibubi.create.foundation.blockEntity.SmartBlockEntity;
import com.vinitech.createsynthesis.content.die.DieHolder;

import net.minecraft.core.BlockPos;
import net.minecraft.world.Containers;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.block.entity.BlockEntity;

@Mixin(value = SmartBlockEntity.class, remap = false)
public abstract class SmartBlockEntityMixin {
	// a press broken with a die in it drops the die
	@Inject(method = "destroy", at = @At("HEAD"))
	private void create_synthesis$dropDie(CallbackInfo ci) {
		if (!((Object) this instanceof DieHolder holder) || holder.create_synthesis$getDie().isEmpty())
			return;
		BlockEntity be = (BlockEntity) (Object) this;
		Level level = be.getLevel();
		BlockPos pos = be.getBlockPos();
		if (level != null && !level.isClientSide)
			Containers.dropItemStack(level, pos.getX(), pos.getY(), pos.getZ(), holder.create_synthesis$getDie());
		holder.create_synthesis$setDie(ItemStack.EMPTY);
	}
}
