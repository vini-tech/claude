package com.vinitech.createsynthesis.content;

import java.util.Comparator;
import java.util.List;

import com.vinitech.createsynthesis.CreateSynthesis;

import net.minecraft.world.item.crafting.CraftingRecipe;
import net.minecraft.world.item.crafting.Recipe;

/**
 * Keeps basin recipes (press and mixer) from stealing each other's ingredients.
 * <p>
 * Create picks the matching recipe with the most item ingredients, so packing recipes
 * (9 diamonds into a block, 4 stone into bricks) beat ours (1 stone + 2 diamonds into an ore).
 * Two rules fix that:
 * <ul>
 * <li>A heated basin does not automate crafting-table recipes. Heat is only needed by processing
 * recipes, so this frees heated basins for them.</li>
 * <li>When one of our recipes matches, it goes first. Create's own order is kept for the rest.</li>
 * </ul>
 */
public final class BasinRecipeRules {
	private BasinRecipeRules() {}

	public static void apply(List<Recipe<?>> recipes, boolean heated) {
		if (heated)
			recipes.removeIf(recipe -> recipe instanceof CraftingRecipe);
		// List.sort is stable, so recipes that are not ours keep Create's order
		recipes.sort(Comparator.comparingInt(recipe -> isOurs(recipe) ? 0 : 1));
	}

	private static boolean isOurs(Recipe<?> recipe) {
		return recipe.getId().getNamespace().equals(CreateSynthesis.ID);
	}
}
