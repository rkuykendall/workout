import { useState, useEffect } from 'react';

const DEBUG = false;

const workoutRoutine = [
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
  { name: 'Elbow Side Plank + Snatch', duration: 25, sets: 3 },
  { name: 'Serratus Pushup', duration: 30, sets: 1 },

  { name: 'Pushup', duration: 30, sets: 1 },
  { name: 'Curl-ups', duration: 30, sets: 1 },

  // { name: 'Push Press', duration: 90, sets: 1 },
  // { name: 'Quadruped Band Horizontal Abduction', duration: 60, sets: 1 },
  // { name: 'Prone T to Y (1 Arm at a Time)', duration: 180, sets: 1 },
].map((workout) => ({ ...workout, duration: DEBUG ? 10 : workout.duration }));

function Workout({ audioContext }: { audioContext: AudioContext }) {
  const [started, setStarted] = useState(true);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [timeLeft, setTimeLeft] = useState(workoutRoutine[0].duration);
  const [isRest, setIsRest] = useState(false);

  useEffect(() => {
    if (!started) return;
    if (timeLeft === 3) {
      playCountdownBeeps();
    }
    if (timeLeft === 0) {
      if (isRest) {
        nextExercise();
      } else {
        if (currentSet < workoutRoutine[currentExerciseIndex].sets) {
          setCurrentSet((prevSet) => prevSet + 1);
          startTimer(workoutRoutine[currentExerciseIndex].duration, false);
        } else {
          startTimer(10, true);
        }
      }
    }

    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, started]);

  function startTimer(duration: number, rest: boolean) {
    setTimeLeft(duration);
    setIsRest(rest);
  }

  function nextExercise() {
    if (currentExerciseIndex + 1 < workoutRoutine.length) {
      setCurrentExerciseIndex((prevIndex) => prevIndex + 1);
      setCurrentSet(1);
      startTimer(workoutRoutine[currentExerciseIndex + 1].duration, false);
    } else {
      setStarted(false);
    }
  }

  function playBeep(frequency: number, startTime: number, duration: number) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, startTime);
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  function playCountdownBeeps() {
    const startTime = audioContext.currentTime;
    const beepDuration = 0.1;

    for (let i = 0; i < 3; i++) {
      playBeep(500, startTime + i, beepDuration);
    }

    const finalBeepStart = startTime + 3;
    playBeep(720, finalBeepStart, 0.3);
  }

  const showUpNext: boolean =
    isRest && currentExerciseIndex + 1 < workoutRoutine.length;

  return (
    <div id="workout-container" className={isRest ? 'resting' : ''}>
      <div id="current-exercise" className="exercise">
        <div id="timer">{timeLeft}</div>

        <div id="exercise-name">
          {showUpNext ? (
            <>Up Next: {workoutRoutine[currentExerciseIndex + 1].name}</>
          ) : (
            workoutRoutine[currentExerciseIndex].name
          )}
        </div>

        <div id="set-count">
          Set {currentSet} of {workoutRoutine[currentExerciseIndex].sets}
        </div>

        <div id="rest-label" className={isRest ? 'visible' : 'hidden'}>
          Resting...
        </div>
      </div>
    </div>
  );
}

export default Workout;
