const DEBUG = false;

export const REST_TIME = DEBUG ? 5 : 15;

interface Workout {
  name: string;
  duration: number;
  sets: number;
}

export const workoutRoutine: Workout[] = [
  { name: 'Dynamic Cross-Body Stretch (Warm-up)', duration: 30, sets: 1 },
  {
    name: 'Alt Shoulder IR/ER with Arms Extended (Warm-up)',
    duration: 30,
    sets: 1,
  },

  { name: 'Doorway Pec Stretch', duration: 30, sets: 3 },
  { name: 'Rhomboid Stretch', duration: 30, sets: 3 },

  { name: 'Open Book Stretch', duration: 120, sets: 2 },
  { name: 'Thread the Needle', duration: 60, sets: 1 },
  { name: 'Plank Walkout (5s Hold)', duration: 45, sets: 3 },
  { name: 'Cat / Cow', duration: 30, sets: 3 },
  { name: 'Y Slide + Lift (Blue/Purple Band)', duration: 60, sets: 3 },
  { name: 'Elbow Side Plank + Snatch', duration: 25, sets: 6 },
  { name: 'Serratus Pushup', duration: 30, sets: 1 },

  { name: 'Pushup', duration: 20, sets: 1 },
  { name: 'Curl-ups', duration: 20, sets: 1 },

  // { name: 'Push Press', duration: 90, sets: 1 },
  // { name: 'Quadruped Band Horizontal Abduction', duration: 60, sets: 1 },
  // { name: 'Prone T to Y (1 Arm at a Time)', duration: 180, sets: 1 },
].map((workout) => ({ ...workout, duration: DEBUG ? 5 : workout.duration }));

export function playBeep(
  audioContext: AudioContext,
  frequency: number,
  startTime: number,
  duration: number
) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, startTime);
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}

export function playCountdownBeeps(audioContext: AudioContext) {
  const startTime = audioContext.currentTime;
  const beepDuration = 0.1;

  for (let i = 0; i < 3; i++) {
    playBeep(audioContext, 500, startTime + i, beepDuration);
  }

  const finalBeepStart = startTime + 3;
  playBeep(audioContext, 720, finalBeepStart, 0.3);
}
