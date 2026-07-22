import { useState, useEffect, useCallback } from 'react';
import clsx from 'clsx';
import { playCountdownBeeps, REST_TIME, workoutRoutine } from './utils';
import { useWakeLock } from './hooks/useWakeLock';

function Workout({ audioContext }: { audioContext: AudioContext }) {
  const [isStarted, setIsStarted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  // The workout opens with a rest/get-ready countdown before the first exercise.
  const [timeLeft, setTimeLeft] = useState(REST_TIME);
  const [isRest, setIsRest] = useState(true);
  const [isRestBetweenSets, setIsRestBetweenSets] = useState(false);
  const [restTime, setRestTime] = useState(REST_TIME);

  // Wake lock to keep screen on during workout
  const {
    isSupported: isWakeLockSupported,
    requestWakeLock,
    releaseWakeLock,
  } = useWakeLock();

  const startTimer = useCallback(
    (duration: number, rest: boolean, betweenSets = false) => {
      setTimeLeft(duration);
      setIsRest(rest);
      setIsRestBetweenSets(betweenSets);
    },
    []
  );

  // Request wake lock when workout starts, release when it ends
  useEffect(() => {
    if (isStarted && isWakeLockSupported) {
      void requestWakeLock();
    } else if (!isStarted) {
      void releaseWakeLock();
    }
  }, [isStarted, isWakeLockSupported, requestWakeLock, releaseWakeLock]);

  useEffect(() => {
    if (!isStarted || isPaused || timeLeft < 0) return;

    if (timeLeft === 3) playCountdownBeeps(audioContext);

    if (timeLeft === 0) {
      setTimeout(() => {
        if (isRest) {
          // Rest is over; begin the exercise it was leading into.
          startTimer(workoutRoutine[currentExerciseIndex].duration, false);
        } else if (currentSet < workoutRoutine[currentExerciseIndex].sets) {
          setCurrentSet((prevSet) => prevSet + 1);
          setRestTime((prevRest) => prevRest + 1);
          startTimer(restTime, true, true);
        } else if (currentExerciseIndex + 1 < workoutRoutine.length) {
          setCurrentExerciseIndex((prevIndex) => prevIndex + 1);
          setCurrentSet(1);
          startTimer(restTime, true, false);
        } else {
          setIsStarted(false);
          setIsComplete(true);
        }
      }, 100);
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [
    timeLeft,
    isStarted,
    isPaused,
    isRest,
    currentSet,
    currentExerciseIndex,
    restTime,
    audioContext,
    startTimer,
  ]);

  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  const resetWorkout = () => {
    setCurrentExerciseIndex(0);
    setCurrentSet(1);
    setRestTime(REST_TIME);
    setIsPaused(false);
    setIsComplete(false);
    startTimer(REST_TIME, true, false);
    setIsStarted(true);
  };

  if (isComplete) {
    return (
      <div id="workout-container" className="complete">
        <div id="complete-message">
          <div id="complete-checkmark">✓</div>
          <h1>Workout Complete!</h1>
          <p>Nice work — you finished every exercise.</p>
        </div>
        <button onClick={resetWorkout} className="button">
          Start Again
        </button>
      </div>
    );
  }

  const showUpNext: boolean = isRest && !isRestBetweenSets;
  const currentExercise = workoutRoutine[currentExerciseIndex];
  const hasMultipleSets: boolean = currentExercise.sets > 1;

  return (
    <div
      id="workout-container"
      className={clsx({ resting: isRest, paused: isPaused })}
    >
      <div id="current-exercise" className="exercise">
        <div id="timer">{timeLeft}</div>
        <div id="exercise-name">
          {showUpNext
            ? `Up Next: ${currentExercise.name}`
            : currentExercise.name}
        </div>
        {hasMultipleSets && (
          <div id="set-count" className="visible">
            {isRest
              ? 'Resting...'
              : `Set ${currentSet} of ${currentExercise.sets}`}
          </div>
        )}
      </div>
      <button onClick={togglePause} className="button">
        {isPaused ? 'Resume' : 'Pause'}
      </button>
    </div>
  );
}

export default Workout;
