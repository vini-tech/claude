package com.vinitech.createsynthesis.content.die;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

import org.jetbrains.annotations.Nullable;

import com.simibubi.create.AllRecipeTypes;
import com.simibubi.create.content.kinetics.press.PressingRecipe;
import com.vinitech.createsynthesis.CreateSynthesis;

import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.crafting.Recipe;
import net.minecraft.world.item.crafting.RecipeType;
import net.minecraft.world.level.Level;

/**
 * Which recipes need which die.
 * <p>
 * A recipe of this mod whose id is {@code create_synthesis:die/<die item>/...} only runs on a press holding that
 * die, and a press holding a die runs nothing else: with a die in, the press stamps instead of pressing.
 */
public final class PressDies {
	private PressDies() {}

	/** The die a recipe needs (the die item's path), or null if it needs none. */
	@Nullable
	public static String dieOf(Recipe<?> recipe) {
		ResourceLocation id = recipe.getId();
		if (!id.getNamespace().equals(CreateSynthesis.ID) || !id.getPath().startsWith("die/"))
			return null;
		String[] parts = id.getPath().split("/");
		return parts.length > 2 ? parts[1] : null;
	}

	@Nullable
	public static String dieId(ItemStack die) {
		if (die.isEmpty())
			return null;
		ResourceLocation key = BuiltInRegistries.ITEM.getKey(die.getItem());
		return key.getNamespace().equals(CreateSynthesis.ID) ? key.getPath() : null;
	}

	public static boolean fits(Recipe<?> recipe, ItemStack die) {
		return Objects.equals(dieOf(recipe), dieId(die));
	}

	/** Pressing on a belt, depot or the ground: the first pressing recipe for this item that fits the die. */
	@SuppressWarnings("unchecked")
	public static Optional<PressingRecipe> findPressing(Level level, ItemStack die, ItemStack item) {
		RecipeType<PressingRecipe> type = (RecipeType<PressingRecipe>) AllRecipeTypes.PRESSING.getType();
		return level.getRecipeManager().getAllRecipesFor(type).stream()
			.filter(recipe -> fits(recipe, die))
			.filter(recipe -> !recipe.getIngredients().isEmpty() && recipe.getIngredients().get(0).test(item))
			.findFirst();
	}

	/** Basin recipes (compacting with the press over a basin): keep only those that fit the die. */
	public static void filterBasin(List<Recipe<?>> recipes, ItemStack die) {
		recipes.removeIf(recipe -> !fits(recipe, die));
	}
}
