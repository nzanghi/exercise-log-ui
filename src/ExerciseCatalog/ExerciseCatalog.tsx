import './exercise-catalog.css';
import { useState, useEffect } from 'react';
import { listExercises } from '../Requests/Requests';
import { Exercise } from '../types';

function ExerciseCatalog() {
  const [exercises, setExercises] = useState([]);

  const loadExercises = async () => {
    setExercises(await listExercises());
  };

  useEffect(() => {
    loadExercises();
  }, []);

  return (
    <div className="exercise-catalog">
      {exercises.length &&
        exercises.map((exercise: Exercise) => (
          <p key={exercise.id}>
            {exercise.exercise_description} {exercise.exercise_weight}
          </p>
        ))}
    </div>
  );
}

export default ExerciseCatalog;
