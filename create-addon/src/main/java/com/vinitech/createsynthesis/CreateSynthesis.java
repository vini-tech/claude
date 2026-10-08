package com.vinitech.createsynthesis;

import org.slf4j.Logger;

import com.mojang.logging.LogUtils;
import com.simibubi.create.foundation.data.CreateRegistrate;
import com.simibubi.create.foundation.item.ItemDescription;
import com.simibubi.create.foundation.item.KineticStats;
import com.simibubi.create.foundation.item.TooltipModifier;
import com.vinitech.createsynthesis.registry.SynthesisCreativeTabs;
import com.vinitech.createsynthesis.registry.SynthesisItems;

import net.createmod.catnip.lang.FontHelper;
import net.fabricmc.api.ModInitializer;
import net.fabricmc.fabric.api.event.lifecycle.v1.ServerLifecycleEvents;
import net.minecraft.resources.ResourceLocation;

public class CreateSynthesis implements ModInitializer {
	public static final String ID = "create_synthesis";
	public static final String NAME = "Create: Synthesis";
	public static final Logger LOGGER = LogUtils.getLogger();

	// Create's Registrate: registers items, blocks and block entities with Create's styling
	// (item descriptions and kinetic stats in tooltips).
	public static final CreateRegistrate REGISTRATE = CreateRegistrate.create(ID)
		.setTooltipModifierFactory(item ->
			new ItemDescription.Modifier(item, FontHelper.Palette.STANDARD_CREATE)
				.andThen(TooltipModifier.mapNull(KineticStats.create(item)))
		);

	@Override
	public void onInitialize() {
		SynthesisCreativeTabs.register();
		SynthesisItems.register();

		REGISTRATE.register();
		ServerLifecycleEvents.SERVER_STARTED.register(server -> {
			long count = server.getRecipeManager().getRecipes().stream()
				.filter(recipe -> recipe.getId().getNamespace().equals(ID))
				.count();
			LOGGER.info("{} loaded {} recipes", NAME, count);
		});
		LOGGER.info("{} initialized", NAME);
	}

	public static ResourceLocation asResource(String path) {
		return new ResourceLocation(ID, path);
	}
}
