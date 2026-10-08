package com.vinitech.createsynthesis.content;

import java.util.Comparator;
import java.util.List;

import com.vinitech.createsynthesis.CreateSynthesis;

import net.minecraft.world.item.crafting.Recipe;

/**
 * Keeps basin recipes (press and mixer) from stealing our ingredients.
 * <p>
 * Create picks the matching recipe with the most item ingredients, so packing recipes
 * (9 diamonds into a block, 4 stone into bricks) beat ours (1 stone + 2 diamonds into an ore).
 * When one of our recipes matches, it goes first instead. Create's own order is kept for the rest,
 * so basins that don't hold one of our recipes behave exactly as in Create.
 */
public final class BasinRecipeRules {
	private BasinRecipeRules() {}

	public static void prioritize(List<Recipe<?>> recipes) {
		// List.sort is stable, so recipes that are not ours keep Create's order
		recipes.sort(Comparator.comparingInt(recipe -> isOurs(recipe) ? 0 : 1));
	}

	public static boolean isOurs(Recipe<?> recipe) {
		return recipe.getId().getNamespace().equals(CreateSynthesis.ID);
	}
}
