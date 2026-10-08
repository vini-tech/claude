package com.vinitech.createsynthesis.mixin;

import java.util.List;

import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

import com.simibubi.create.content.processing.basin.BasinOperatingBlockEntity;
import com.vinitech.createsynthesis.content.BasinRecipeRules;

import net.minecraft.world.item.crafting.Recipe;
import net.minecraft.world.level.block.entity.BlockEntity;

@Mixin(value = BasinOperatingBlockEntity.class, remap = false)
public abstract class BasinOperatingBlockEntityMixin {
	@Shadow
	protected Recipe<?> currentRecipe;

	@Shadow
	protected abstract List<Recipe<?>> getMatchingRecipes();

	@Inject(method = "getMatchingRecipes", at = @At("RETURN"))
	private void create_synthesis$prioritize(CallbackInfoReturnable<List<Recipe<?>>> cir) {
		BasinRecipeRules.prioritize(cir.getReturnValue());
	}

	// The recipe is picked when the press/mixer starts its cycle. If the rest of our ingredients
	// arrived during the cycle (diamonds landing after the stone), switch to our recipe before applying.
	@Inject(method = "applyBasinRecipe", at = @At("HEAD"))
	private void create_synthesis$switchToOurs(CallbackInfo ci) {
		if (currentRecipe == null || BasinRecipeRules.isOurs(currentRecipe))
			return;
		var level = ((BlockEntity) (Object) this).getLevel();
		if (level == null || level.isClientSide)
			return;
		List<Recipe<?>> recipes = getMatchingRecipes();
		if (!recipes.isEmpty() && BasinRecipeRules.isOurs(recipes.get(0)))
			currentRecipe = recipes.get(0);
	}
}
