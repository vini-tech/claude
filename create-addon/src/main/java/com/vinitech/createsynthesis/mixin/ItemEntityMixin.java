package com.vinitech.createsynthesis.mixin;

import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

import com.vinitech.createsynthesis.content.feed.FeedFlakeEntity;
import com.vinitech.createsynthesis.registry.SynthesisItems;

import net.minecraft.world.entity.item.ItemEntity;

@Mixin(ItemEntity.class)
public abstract class ItemEntityMixin {
	// Fish Feed that lands in water breaks up into floating flakes, one per item
	@Inject(method = "tick", at = @At("TAIL"))
	private void create_synthesis$scatterFishFeed(CallbackInfo ci) {
		ItemEntity self = (ItemEntity) (Object) this;
		if (self.level().isClientSide || self.isRemoved() || !self.isInWater()
			|| !self.getItem().is(SynthesisItems.FISH_FEED.get()))
			return;
		FeedFlakeEntity.scatter(self.level(), self.position(), self.getItem().getCount());
		self.discard();
	}
}
