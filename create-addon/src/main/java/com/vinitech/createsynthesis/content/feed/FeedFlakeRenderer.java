package com.vinitech.createsynthesis.content.feed;

import com.mojang.blaze3d.vertex.PoseStack;
import com.mojang.math.Axis;
import com.vinitech.createsynthesis.registry.SynthesisItems;

import net.minecraft.client.renderer.MultiBufferSource;
import net.minecraft.client.renderer.entity.EntityRenderer;
import net.minecraft.client.renderer.entity.EntityRendererProvider;
import net.minecraft.client.renderer.entity.ItemRenderer;
import net.minecraft.client.renderer.texture.OverlayTexture;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.world.inventory.InventoryMenu;
import net.minecraft.world.item.ItemDisplayContext;
import net.minecraft.world.item.ItemStack;

/** A flake is drawn as a tiny, slowly turning piece of Fish Feed. */
public class FeedFlakeRenderer extends EntityRenderer<FeedFlakeEntity> {
	private final ItemRenderer items;
	private final ItemStack look = new ItemStack(SynthesisItems.FISH_FEED.get());

	public FeedFlakeRenderer(EntityRendererProvider.Context context) {
		super(context);
		items = context.getItemRenderer();
		shadowRadius = 0;
	}

	@Override
	public void render(FeedFlakeEntity flake, float yaw, float partialTicks, PoseStack ms, MultiBufferSource buffer,
		int light) {
		ms.pushPose();
		ms.translate(0, .05, 0);
		ms.mulPose(Axis.YP.rotationDegrees((flake.getAge() + partialTicks) * 3 + flake.getId() * 37));
		ms.mulPose(Axis.XP.rotationDegrees(90));
		ms.scale(.25f, .25f, .25f);
		items.renderStatic(look, ItemDisplayContext.GROUND, light, OverlayTexture.NO_OVERLAY, ms, buffer, flake.level(),
			flake.getId());
		ms.popPose();
		super.render(flake, yaw, partialTicks, ms, buffer, light);
	}

	@Override
	public ResourceLocation getTextureLocation(FeedFlakeEntity flake) {
		return InventoryMenu.BLOCK_ATLAS;
	}
}
