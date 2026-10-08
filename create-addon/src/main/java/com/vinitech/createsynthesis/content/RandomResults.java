package com.vinitech.createsynthesis.content;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

import com.simibubi.create.content.processing.recipe.ProcessingOutput;
import com.vinitech.createsynthesis.CreateSynthesis;

import net.minecraft.resources.ResourceLocation;
import net.minecraft.world.item.ItemStack;

/**
 * "Exactly one of these" results, for items the game itself hands out at random (music discs, pottery sherds,
 * goat horn sounds...). Create rolls every result on its own, so it can give none or several.
 * <p>
 * A recipe of this mod whose last path segment starts with {@code random_} instead picks exactly one of its
 * results, weighted by their chances. The chances in the JSON are the real odds, so recipe viewers show them right.
 */
public final class RandomResults {
	private RandomResults() {}

	public static boolean picksOne(ResourceLocation id) {
		if (!id.getNamespace().equals(CreateSynthesis.ID))
			return false;
		String path = id.getPath();
		return path.substring(path.lastIndexOf('/') + 1).startsWith("random_");
	}

	public static List<ItemStack> pickOne(List<ProcessingOutput> outputs) {
		float total = 0;
		for (ProcessingOutput output : outputs)
			total += output.getChance();
		float roll = ThreadLocalRandom.current().nextFloat() * total;
		for (ProcessingOutput output : outputs) {
			roll -= output.getChance();
			if (roll < 0)
				return List.of(output.getStack().copy());
		}
		return outputs.isEmpty() ? List.of() : List.of(outputs.get(outputs.size() - 1).getStack().copy());
	}
}
