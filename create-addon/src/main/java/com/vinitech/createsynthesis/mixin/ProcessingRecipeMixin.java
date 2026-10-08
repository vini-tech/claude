package com.vinitech.createsynthesis.mixin;

import java.util.List;

import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

import com.simibubi.create.content.processing.recipe.ProcessingOutput;
import com.simibubi.create.content.processing.recipe.ProcessingRecipe;
import com.vinitech.createsynthesis.content.RandomResults;

import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.crafting.Recipe;

@Mixin(value = ProcessingRecipe.class, remap = false)
public abstract class ProcessingRecipeMixin {
	@Inject(method = "rollResults(Ljava/util/List;)Ljava/util/List;", at = @At("HEAD"), cancellable = true)
	private void create_synthesis$pickOne(List<ProcessingOutput> outputs, CallbackInfoReturnable<List<ItemStack>> cir) {
		if (RandomResults.picksOne(((Recipe<?>) (Object) this).getId()))
			cir.setReturnValue(RandomResults.pickOne(outputs));
	}
}
