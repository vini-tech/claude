package com.vinitech.createsynthesis;

import com.vinitech.createsynthesis.content.feed.FeedFlakeRenderer;
import com.vinitech.createsynthesis.registry.SynthesisEntities;

import net.fabricmc.api.ClientModInitializer;
import net.fabricmc.fabric.api.client.rendering.v1.EntityRendererRegistry;
import net.minecraft.client.Minecraft;

public class CreateSynthesisClient implements ClientModInitializer {
	@Override
	public void onInitializeClient() {
		CreateSynthesis.clientTime = () -> {
			var level = Minecraft.getInstance().level;
			return level == null ? -1 : level.getGameTime();
		};
		EntityRendererRegistry.register(SynthesisEntities.FEED_FLAKE, FeedFlakeRenderer::new);
	}
}
