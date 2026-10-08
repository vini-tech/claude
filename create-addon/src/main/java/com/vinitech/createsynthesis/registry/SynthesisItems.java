package com.vinitech.createsynthesis.registry;

import com.simibubi.create.content.processing.sequenced.SequencedAssemblyItem;
import com.vinitech.createsynthesis.CreateSynthesis;

import net.minecraft.core.Registry;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.world.item.Item;

public class SynthesisItems {
	public static void register() {
		// transitional items of sequenced assembly recipes; kept out of the creative tab, like Create's own
		for (String name : SynthesisIncompleteItems.NAMES)
			Registry.register(BuiltInRegistries.ITEM, CreateSynthesis.asResource(name),
				new SequencedAssemblyItem(new Item.Properties()));
	}
}
