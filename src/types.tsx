export interface Journal {
  id: number;
  author: string;
  muscle_group: string;
  entry_date: string;
  notes?: string;
  journal_start: string;
  journal_finish: string;
}

export interface JournalEntry {
  id: number;
  journal_id: number;
  exercises_finished: string[];
}

export interface Exercise {
  id?: number;
  journal_entry_id: number;
  exercise_description: string;
  exercise_weight: string;
  exercise_sets: number;
  exercise_repetitions: number;
}
