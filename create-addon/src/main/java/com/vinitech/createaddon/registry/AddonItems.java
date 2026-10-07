package com.vinitech.createaddon.registry;

import static com.vinitech.createaddon.CreateAddon.REGISTRATE;

import com.tterrag.registrate.util.entry.ItemEntry;

import net.minecraft.world.item.Item;

public class AddonItems {
	// item de exemplo para confirmar que o add-on carrega junto com o Create; pode ser removido
	public static final ItemEntry<Item> EXAMPLE_ALLOY = REGISTRATE.item("example_alloy", Item::new)
		.register();

	public static void register() {
		// carrega a classe
	}
}
