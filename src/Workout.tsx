import { useState, useEffect, useCallback } from 'react';
import { playCountdownBeeps, REST_TIME, workoutRoutine } from './utils';

function Workout({ audioContext }: { audioContext: AudioContext }) {
  const [isStarted, setIsStarted] = useState(true);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [timeLeft, setTimeLeft] = useState(workoutRoutine[0].duration);
  const [isRest, setIsRest] = useState(false);
  const [isRestBetweenSets, setIsRestBetweenSets] = useState(false);

  const startTimer = useCallback(
    (duration: number, rest: boolean, betweenSets: boolean = false) => {
      setTimeLeft(duration);
      setIsRest(rest);
      setIsRestBetweenSets(betweenSets);
    },
    []
  );

  const nextExercise = useCallback(() => {
    if (currentExerciseIndex + 1 < workoutRoutine.length) {
      setCurrentExerciseIndex((prevIndex) => prevIndex + 1);
      setCurrentSet(1);
      startTimer(workoutRoutine[currentExerciseIndex + 1].duration, false);
    } else {
      setIsStarted(false);
    }
  }, [currentExerciseIndex, startTimer]);

  useEffect(() => {
    if (!isStarted) return;

    if (timeLeft === 3) {
      playCountdownBeeps(audioContext);
    }

    if (timeLeft === 0) {
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
          startTimer(10, true, true); // Rest between sets
        } else {
          startTimer(REST_TIME, true); // Rest between exercises
        }
      }
    }

    const timer = setInterval(
      () => setTimeLeft((prevTime) => prevTime - 1),
      1000
    );
    return () => clearInterval(timer);
  }, [
    timeLeft,
    isStarted,
    isRest,
    isRestBetweenSets,
    currentSet,
    currentExerciseIndex,
    audioContext,
    nextExercise,
    startTimer,
  ]);

  const showUpNext =
    isRest &&
    !isRestBetweenSets &&
    currentExerciseIndex + 1 < workoutRoutine.length;
  const currentExercise = workoutRoutine[currentExerciseIndex];
  const nextExerciseName = workoutRoutine[currentExerciseIndex + 1]?.name;
  const hasMultipleSets = currentExercise.sets > 1;

  return (
    <div id="workout-container" className={isRest ? 'resting' : ''}>
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
    </div>
  );
}

export default Workout;
