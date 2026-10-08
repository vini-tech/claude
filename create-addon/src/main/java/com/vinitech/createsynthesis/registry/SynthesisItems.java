package com.vinitech.createsynthesis.registry;

import com.simibubi.create.content.processing.sequenced.SequencedAssemblyItem;
import com.tterrag.registrate.util.entry.ItemEntry;
import com.vinitech.createsynthesis.CreateSynthesis;
import com.vinitech.createsynthesis.content.die.PressDieItem;

import net.minecraft.core.Registry;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.world.item.Item;

public class SynthesisItems {
	// press dies: clicked into a Mechanical Press, which then stamps with them
	public static final ItemEntry<PressDieItem> ENGRAVING_DIE = die("engraving_die");
	public static final ItemEntry<PressDieItem> SHERD_STAMP = die("sherd_stamp");
	public static final ItemEntry<PressDieItem> TEMPLATE_DIE = die("template_die");

	// deployer tips: held by a Deployer, they wear down instead of being used up
	public static final ItemEntry<Item> CARVING_CHISEL = tip("carving_chisel", 256);
	public static final ItemEntry<Item> CORAL_GRAFT = tip("coral_graft", 128);

	private static ItemEntry<PressDieItem> die(String name) {
		return CreateSynthesis.REGISTRATE.item(name, PressDieItem::new).register();
	}

	private static ItemEntry<Item> tip(String name, int durability) {
		return CreateSynthesis.REGISTRATE.item(name, Item::new)
			.properties(p -> p.durability(durability))
			.register();
	}

	public static void register() {
		// intermediate materials; registered through Registrate so they land in the creative tab
		for (String name : SynthesisMaterials.NAMES)
			CreateSynthesis.REGISTRATE.item(name, Item::new).register();

		// transitional items of sequenced assembly recipes; kept out of the creative tab, like Create's own
		for (String name : SynthesisIncompleteItems.NAMES)
			Registry.register(BuiltInRegistries.ITEM, CreateSynthesis.asResource(name),
				new SequencedAssemblyItem(new Item.Properties()));
	}
}
