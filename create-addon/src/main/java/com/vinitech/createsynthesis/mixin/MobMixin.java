package com.vinitech.createsynthesis.mixin;

import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Unique;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

import com.vinitech.createsynthesis.content.feed.Fattenable;

import net.minecraft.nbt.CompoundTag;
import net.minecraft.network.syncher.EntityDataAccessor;
import net.minecraft.network.syncher.EntityDataSerializers;
import net.minecraft.network.syncher.SynchedEntityData;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.entity.Mob;
import net.minecraft.world.level.Level;

// fatness lives on every Mob as synced entity data, so clients can draw fattened mobs bigger
@Mixin(Mob.class)
public abstract class MobMixin extends LivingEntity implements Fattenable {
	@Unique
	private static final EntityDataAccessor<Integer> CREATE_SYNTHESIS$FATNESS =
		SynchedEntityData.defineId(Mob.class, EntityDataSerializers.INT);

	protected MobMixin(EntityType<? extends LivingEntity> type, Level level) {
		super(type, level);
	}

	@Override
	public int create_synthesis$getFatness() {
		return entityData.get(CREATE_SYNTHESIS$FATNESS);
	}

	@Override
	public void create_synthesis$setFatness(int fatness) {
		entityData.set(CREATE_SYNTHESIS$FATNESS, fatness);
	}

	@Inject(method = "defineSynchedData", at = @At("TAIL"))
	private void create_synthesis$defineFatness(CallbackInfo ci) {
		entityData.define(CREATE_SYNTHESIS$FATNESS, 0);
	}

	@Inject(method = "addAdditionalSaveData", at = @At("TAIL"))
	private void create_synthesis$saveFatness(CompoundTag tag, CallbackInfo ci) {
		if (create_synthesis$getFatness() > 0)
			tag.putInt("SynthesisFatness", create_synthesis$getFatness());
	}

	@Inject(method = "readAdditionalSaveData", at = @At("TAIL"))
	private void create_synthesis$readFatness(CompoundTag tag, CallbackInfo ci) {
		create_synthesis$setFatness(tag.getInt("SynthesisFatness"));
	}
}
