package com.vinitech.createsynthesis.content.feed;

/** Implemented by every Mob (through a mixin): how many times it was fattened, synced to clients. */
public interface Fattenable {
	int create_synthesis$getFatness();

	void create_synthesis$setFatness(int fatness);
}
