import { Exercise } from '../types';

export const defaultJournalEntry = (journalId: number) => ({
  journal_id: journalId,
  exercises_finished: [],
});

export const defaultExercise = (journalEntryId: number): Exercise => ({
  journal_entry_id: journalEntryId,
  exercise_description: '',
  exercise_weight: '',
  exercise_sets: 0,
  exercise_repetitions: 0,
});
