import { AudioLooper } from "./audioLooper";

let looper: AudioLooper | null = null;

export const handleAudioLoop = async (args: { action: "play" | "stop" }) => {
  if (typeof window === "undefined") {
    return;
  }
  if (!looper) {
    looper = new AudioLooper("audio/hold_music.mp3");
  }
  console.log("AudioLoop tool called with action:", args.action);
  if (args.action === "play") {
    await looper.play();
  } else if (args.action === "stop") {
    await looper.stop();
  }
  // No data channel logic here!
};

export default handleAudioLoop;