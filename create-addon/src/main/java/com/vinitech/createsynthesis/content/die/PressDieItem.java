package com.vinitech.createsynthesis.content.die;

import net.minecraft.world.item.Item;

/** A die that clicks into a Mechanical Press; the press then stamps with it instead of pressing. */
public class PressDieItem extends Item {
	public PressDieItem(Properties properties) {
		super(properties.stacksTo(1));
	}
}
