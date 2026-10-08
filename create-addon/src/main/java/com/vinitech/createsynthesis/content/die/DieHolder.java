package com.vinitech.createsynthesis.content.die;

import net.minecraft.world.item.ItemStack;

/** Implemented by the Mechanical Press (through a mixin): the die clicked into it. */
public interface DieHolder {
	ItemStack create_synthesis$getDie();

	void create_synthesis$setDie(ItemStack die);
}
