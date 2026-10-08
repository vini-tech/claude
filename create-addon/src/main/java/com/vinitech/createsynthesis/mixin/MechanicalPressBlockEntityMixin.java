package com.vinitech.createsynthesis.mixin;

import java.util.Optional;

import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Unique;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

import com.simibubi.create.content.kinetics.press.MechanicalPressBlockEntity;
import com.simibubi.create.content.kinetics.press.PressingRecipe;
import com.vinitech.createsynthesis.content.die.DieHolder;
import com.vinitech.createsynthesis.content.die.PressDies;

import net.minecraft.nbt.CompoundTag;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.block.entity.BlockEntity;

@Mixin(value = MechanicalPressBlockEntity.class, remap = false)
public abstract class MechanicalPressBlockEntityMixin implements DieHolder {
	@Unique
	private ItemStack create_synthesis$die = ItemStack.EMPTY;

	@Override
	public ItemStack create_synthesis$getDie() {
		return create_synthesis$die;
	}

	@Override
	public void create_synthesis$setDie(ItemStack die) {
		create_synthesis$die = die;
	}

	@Inject(method = "write", at = @At("TAIL"))
	private void create_synthesis$writeDie(CompoundTag compound, boolean clientPacket, CallbackInfo ci) {
		if (!create_synthesis$die.isEmpty())
			compound.put("SynthesisDie", create_synthesis$die.save(new CompoundTag()));
	}

	@Inject(method = "read", at = @At("TAIL"))
	private void create_synthesis$readDie(CompoundTag compound, boolean clientPacket, CallbackInfo ci) {
		create_synthesis$die = compound.contains("SynthesisDie") ? ItemStack.of(compound.getCompound("SynthesisDie")) : ItemStack.EMPTY;
	}

	// with a die in, the press stamps with it instead of pressing (belt, depot, ground)
	@Inject(method = "getRecipe", at = @At("HEAD"), cancellable = true)
	private void create_synthesis$stampWithDie(ItemStack item, CallbackInfoReturnable<Optional<PressingRecipe>> cir) {
		Level level = ((BlockEntity) (Object) this).getLevel();
		if (!create_synthesis$die.isEmpty() && level != null)
			cir.setReturnValue(PressDies.findPressing(level, create_synthesis$die, item));
	}

	// without a die, recipes that need one are skipped
	@Inject(method = "getRecipe", at = @At("RETURN"), cancellable = true)
	private void create_synthesis$skipDieRecipes(ItemStack item, CallbackInfoReturnable<Optional<PressingRecipe>> cir) {
		Level level = ((BlockEntity) (Object) this).getLevel();
		Optional<PressingRecipe> recipe = cir.getReturnValue();
		if (create_synthesis$die.isEmpty() && level != null && recipe.isPresent() && PressDies.dieOf(recipe.get()) != null)
			cir.setReturnValue(PressDies.findPressing(level, ItemStack.EMPTY, item));
	}
}
