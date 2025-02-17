import { useState } from 'react';
import './App.css';
import Workout from './Workout';

function App() {
  const [audioContext, setAudioContext] = useState<AudioContext>();

  if (audioContext) {
    return <Workout audioContext={audioContext} />;
  }

  return (
    <div id="workout-container">
      <button
        id="start-button"
        className="button"
        onClick={() => {
          const audioContext = new window.AudioContext();
          setAudioContext(audioContext);
        }}
      >
        Start Workout
      </button>
    </div>
  );
}

export default App;
