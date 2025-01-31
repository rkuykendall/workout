import { useState, useEffect } from 'react';
import { playCountdownBeeps, workoutRoutine } from './utils';

function Workout({ audioContext }: { audioContext: AudioContext }) {
  const [started, setStarted] = useState(true);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [timeLeft, setTimeLeft] = useState(workoutRoutine[0].duration);
  const [isRest, setIsRest] = useState(false);
  const [restBetweenSets, setRestBetweenSets] = useState(false);

  useEffect(() => {
    if (!started) return;
    if (timeLeft === 3) {
      playCountdownBeeps(audioContext);
    }
    if (timeLeft === 0) {
      if (isRest) {
        if (restBetweenSets) {
          setRestBetweenSets(false);
          startTimer(workoutRoutine[currentExerciseIndex].duration, false);
        } else {
          nextExercise();
        }
      } else {
        if (currentSet < workoutRoutine[currentExerciseIndex].sets) {
          setCurrentSet((prevSet) => prevSet + 1);
          startTimer(10, true, true); // Rest between sets
        } else {
          startTimer(15, true, false); // Rest between exercises
        }
      }
    }

    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, started]);

  function startTimer(
    duration: number,
    rest: boolean,
    betweenSets: boolean = false
  ) {
    setTimeLeft(duration);
    setIsRest(rest);
    setRestBetweenSets(betweenSets);
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

  const showUpNext: boolean =
    isRest &&
    !restBetweenSets &&
    currentExerciseIndex + 1 < workoutRoutine.length;

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

        <div
          id="set-count"
          className={
            workoutRoutine[currentExerciseIndex].sets === 1
              ? 'hidden'
              : 'visible'
          }
        >
          {isRest
            ? 'Resting...'
            : `Set ${currentSet} of ${workoutRoutine[currentExerciseIndex].sets}`}
        </div>
      </div>
    </div>
  );
}

export default Workout;
