// SharedRefs.ts
export const isWaitingForSupervisorRef = { current: false };

export const holdMusicStartedAtRef  = { current: 0 };

export const holdMusicTimeoutRef = { current: null as null | ReturnType<typeof setTimeout> };