package com.vinitech.createsynthesis.mixin;

import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

import com.vinitech.createsynthesis.content.feed.Fattening;

import net.minecraft.world.damagesource.DamageSource;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.item.Item;
import net.minecraft.world.item.ItemStack;

@Mixin(LivingEntity.class)
public abstract class LivingEntityMixin {
	// a fattened animal or fish drops one more piece of meat per level
	@Inject(method = "dropAllDeathLoot", at = @At("TAIL"))
	private void create_synthesis$dropExtraMeat(DamageSource source, CallbackInfo ci) {
		LivingEntity self = (LivingEntity) (Object) this;
		int fatness = Fattening.fatness(self);
		Item meat = Fattening.meatOf(self);
		if (fatness > 0 && meat != null)
			self.spawnAtLocation(new ItemStack(meat, fatness));
	}
}
