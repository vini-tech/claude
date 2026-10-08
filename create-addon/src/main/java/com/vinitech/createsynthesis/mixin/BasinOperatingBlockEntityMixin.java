package com.vinitech.createsynthesis.mixin;

import java.util.List;
import java.util.Optional;

import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

import com.simibubi.create.content.processing.basin.BasinBlockEntity;
import com.simibubi.create.content.processing.basin.BasinOperatingBlockEntity;
import com.simibubi.create.content.processing.recipe.HeatCondition;
import com.vinitech.createsynthesis.content.BasinRecipeRules;

import net.minecraft.world.item.crafting.Recipe;

@Mixin(value = BasinOperatingBlockEntity.class, remap = false)
public abstract class BasinOperatingBlockEntityMixin {
	@Shadow
	protected abstract Optional<BasinBlockEntity> getBasin();

	@Inject(method = "getMatchingRecipes", at = @At("RETURN"))
	private void create_synthesis$applyBasinRules(CallbackInfoReturnable<List<Recipe<?>>> cir) {
		List<Recipe<?>> recipes = cir.getReturnValue();
		if (recipes.isEmpty())
			return;
		boolean heated = getBasin()
			.filter(basin -> basin.getLevel() != null)
			.map(basin -> BasinBlockEntity.getHeatLevelOf(basin.getLevel().getBlockState(basin.getBlockPos().below())))
			.map(HeatCondition.HEATED::testBlazeBurner)
			.orElse(false);
		BasinRecipeRules.apply(recipes, heated);
	}
}
