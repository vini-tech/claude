package com.vinitech.createsynthesis.registry;

import com.simibubi.create.content.fluids.VirtualFluid;
import com.tterrag.registrate.util.entry.FluidEntry;
import com.vinitech.createsynthesis.CreateSynthesis;

import net.fabricmc.fabric.api.transfer.v1.fluid.FluidVariant;
import net.fabricmc.fabric.api.transfer.v1.fluid.FluidVariantAttributeHandler;
import net.minecraft.network.chat.Component;

@SuppressWarnings("UnstableApiUsage")
public class SynthesisFluids {
	// Virtual, like Create's Builder's Tea: it lives in pipes, tanks and basins only (no bucket, no block).
	// 50 mB fills a fifth of a Bottle o' Enchanting.
	public static final FluidEntry<VirtualFluid> EXPERIENCE_ESSENCE = CreateSynthesis.REGISTRATE
		.virtualFluid("experience_essence")
		.fluidAttributes(() -> new Named("fluid.create_synthesis.experience_essence"))
		.register();

	public static void register() {
	}

	private record Named(String key) implements FluidVariantAttributeHandler {
		@Override
		public Component getName(FluidVariant variant) {
			return Component.translatable(key);
		}
	}
}
