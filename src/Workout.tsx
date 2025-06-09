import { useState, useEffect, useCallback } from 'react';
import clsx from 'clsx';
import { playCountdownBeeps, REST_TIME, workoutRoutine } from './utils';
import { useWakeLock } from './hooks/useWakeLock';

function Workout({ audioContext }: { audioContext: AudioContext }) {
  const [isStarted, setIsStarted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [timeLeft, setTimeLeft] = useState(workoutRoutine[0].duration);
  const [isRest, setIsRest] = useState(false);
  const [isRestBetweenSets, setIsRestBetweenSets] = useState(false);
  const [restTime, setRestTime] = useState(REST_TIME);

  // Wake lock to keep screen on during workout
  const { isSupported: isWakeLockSupported, requestWakeLock, releaseWakeLock } = useWakeLock();

  const startTimer = useCallback(
    (duration: number, rest: boolean, betweenSets = false) => {
      setTimeLeft(duration);
      setIsRest(rest);
      setIsRestBetweenSets(betweenSets);
    },
    []
  );

  const nextExercise = useCallback(() => {
    setCurrentExerciseIndex((prevIndex) => {
      if (prevIndex + 1 < workoutRoutine.length) {
        setCurrentSet(1);
        startTimer(workoutRoutine[prevIndex + 1].duration, false);
        return prevIndex + 1;
      } else {
        setIsStarted(false);
        return prevIndex;
      }
    });
  }, [startTimer]);

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
          if (isRestBetweenSets) {
            setIsRestBetweenSets(false);
            startTimer(workoutRoutine[currentExerciseIndex].duration, false);
          } else {
            nextExercise();
          }
        } else {
          if (currentSet < workoutRoutine[currentExerciseIndex].sets) {
            setCurrentSet((prevSet) => prevSet + 1);
            setRestTime((prevRest) => prevRest + 1);
            startTimer(restTime, true, true);
          } else {
            startTimer(restTime, true);
          }
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
    isRestBetweenSets,
    currentSet,
    currentExerciseIndex,
    restTime,
    audioContext,
    nextExercise,
    startTimer,
  ]);

  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  const showUpNext: boolean =
    isRest &&
    !isRestBetweenSets &&
    currentExerciseIndex + 1 < workoutRoutine.length;
  const currentExercise = workoutRoutine[currentExerciseIndex];
  const nextExerciseName = workoutRoutine[currentExerciseIndex + 1]?.name;
  const hasMultipleSets: boolean = currentExercise.sets > 1;

  return (
    <div
      id="workout-container"
      className={clsx({ resting: isRest, paused: isPaused })}
    >
      <div id="current-exercise" className="exercise">
        <div id="timer">{timeLeft}</div>
        <div id="exercise-name">
          {showUpNext ? `Up Next: ${nextExerciseName}` : currentExercise.name}
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
