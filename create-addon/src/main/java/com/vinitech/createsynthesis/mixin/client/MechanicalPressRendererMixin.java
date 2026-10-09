package com.vinitech.createsynthesis.mixin.client;

import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

import com.mojang.blaze3d.vertex.PoseStack;
import com.mojang.math.Axis;
import com.simibubi.create.content.kinetics.press.MechanicalPressBlockEntity;
import com.simibubi.create.content.kinetics.press.MechanicalPressRenderer;
import com.simibubi.create.content.kinetics.press.PressingBehaviour;
import com.vinitech.createsynthesis.content.die.DieHolder;

import net.minecraft.client.Minecraft;
import net.minecraft.client.renderer.MultiBufferSource;
import net.minecraft.world.item.ItemDisplayContext;
import net.minecraft.world.item.ItemStack;

@Mixin(value = MechanicalPressRenderer.class, remap = false)
public abstract class MechanicalPressRendererMixin {
	// the fitted die (a 3D model lying flat, face down) rides under the press head
	@Inject(method = "renderSafe", at = @At("HEAD"))
	private void create_synthesis$renderDie(MechanicalPressBlockEntity be, float partialTicks, PoseStack ms,
		MultiBufferSource buffer, int light, int overlay, CallbackInfo ci) {
		ItemStack die = ((DieHolder) be).create_synthesis$getDie();
		if (die.isEmpty())
			return;
		PressingBehaviour pressing = be.getPressingBehaviour();
		float headOffset = pressing.getRenderedHeadOffset(partialTicks) * pressing.mode.headOffset;
		ms.pushPose();
		// the item renderer centres the model on the origin; once flipped, its base sits at the bottom of the
		// press block, right under the head, and the rest of the die hangs below it
		ms.translate(.5, -.5 - headOffset, .5);
		ms.mulPose(Axis.XP.rotationDegrees(180)); // face down, towards the item being stamped
		Minecraft.getInstance().getItemRenderer()
			.renderStatic(die, ItemDisplayContext.NONE, light, overlay, ms, buffer, be.getLevel(), 0);
		ms.popPose();
	}
}
