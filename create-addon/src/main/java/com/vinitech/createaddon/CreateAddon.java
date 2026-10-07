package com.vinitech.createaddon;

import org.slf4j.Logger;

import com.mojang.logging.LogUtils;
import com.simibubi.create.foundation.data.CreateRegistrate;
import com.simibubi.create.foundation.item.ItemDescription;
import com.simibubi.create.foundation.item.KineticStats;
import com.simibubi.create.foundation.item.TooltipModifier;
import com.vinitech.createaddon.registry.AddonCreativeTabs;
import com.vinitech.createaddon.registry.AddonItems;

import net.createmod.catnip.lang.FontHelper;
import net.fabricmc.api.ModInitializer;
import net.minecraft.resources.ResourceLocation;

public class CreateAddon implements ModInitializer {
	public static final String ID = "createaddon";
	public static final String NAME = "Create Addon";
	public static final Logger LOGGER = LogUtils.getLogger();

	// Registrate do Create: registra itens, blocos e block entities com o estilo do Create
	// (tooltips com descrição e estatísticas cinéticas).
	public static final CreateRegistrate REGISTRATE = CreateRegistrate.create(ID)
		.setTooltipModifierFactory(item ->
			new ItemDescription.Modifier(item, FontHelper.Palette.STANDARD_CREATE)
				.andThen(TooltipModifier.mapNull(KineticStats.create(item)))
		);

	@Override
	public void onInitialize() {
		AddonCreativeTabs.register();
		AddonItems.register();

		REGISTRATE.register();
		LOGGER.info("{} carregado", NAME);
	}

	public static ResourceLocation asResource(String path) {
		return new ResourceLocation(ID, path);
	}
}
