package com.vinitech.createsynthesis.content.feed;

import com.vinitech.createsynthesis.registry.SynthesisEntities;

import net.minecraft.nbt.CompoundTag;
import net.minecraft.network.protocol.Packet;
import net.minecraft.network.protocol.game.ClientGamePacketListener;
import net.minecraft.network.protocol.game.ClientboundAddEntityPacket;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.MoverType;
import net.minecraft.world.level.Level;
import net.minecraft.world.phys.Vec3;

/**
 * A tiny flake of Fish Feed: floats in the water and sinks slowly, like real fish food. Fish swim to it and eat it
 * (see {@link EatFlakeGoal}); one flake feeds one fish. Uneaten flakes dissolve after two minutes.
 */
public class FeedFlakeEntity extends Entity {
	private static final int LIFETIME = 20 * 120;
	private int age;

	public FeedFlakeEntity(EntityType<?> type, Level level) {
		super(type, level);
	}

	public static void scatter(Level level, Vec3 pos, int count) {
		for (int i = 0; i < Math.min(count, 64); i++) {
			FeedFlakeEntity flake = new FeedFlakeEntity(SynthesisEntities.FEED_FLAKE, level);
			flake.setPos(pos.x, pos.y, pos.z);
			flake.setDeltaMovement((level.random.nextDouble() - .5) * .2, level.random.nextDouble() * .05,
				(level.random.nextDouble() - .5) * .2);
			level.addFreshEntity(flake);
		}
	}

	public int getAge() {
		return age;
	}

	@Override
	public void tick() {
		super.tick();
		age++;
		Vec3 motion = getDeltaMovement();
		if (isInWater())
			setDeltaMovement(motion.x * .9, Math.max(motion.y * .9 - .002, -.015), motion.z * .9);
		else
			setDeltaMovement(motion.x * .98, motion.y - .04, motion.z * .98);
		move(MoverType.SELF, getDeltaMovement());
		if (!level().isClientSide && age > LIFETIME)
			discard();
	}

	@Override
	protected void defineSynchedData() {
	}

	@Override
	protected void readAdditionalSaveData(CompoundTag tag) {
		age = tag.getInt("Age");
	}

	@Override
	protected void addAdditionalSaveData(CompoundTag tag) {
		tag.putInt("Age", age);
	}

	@Override
	public Packet<ClientGamePacketListener> getAddEntityPacket() {
		return new ClientboundAddEntityPacket(this);
	}
}
