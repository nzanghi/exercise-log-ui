import { Journal, JournalEntry, Exercise } from '../types';

const EXERCISE_API_URL = 'http://localhost:8080';

// Journal
export const createJournal = async (author: string) => {
  const response = await fetch(`${EXERCISE_API_URL}/journals`, {
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify({ author }),
  });
  return response.json();
};

export const fetchJournalsWithAuthor = async (author: string) => {
  const response = await fetch(`${EXERCISE_API_URL}/journals/authors/${author}`, {
    method: 'GET',
    headers: { 'Content-type': 'application/json' },
  });
  return response.json();
};

export const updateJournal = async (journal: Journal) => {
  const response = await fetch(`${EXERCISE_API_URL}/journals/${journal.id}`, {
    method: 'PUT',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify(journal),
  });
  return response.json();
};

export const deleteJournal = async (entryId: number) => {
  const response = await fetch(`${EXERCISE_API_URL}/journals/${entryId}`, {
    method: 'DELETE',
    headers: { 'Content-type': 'application/json' },
  });
  return response.text();
};

// Journal Entries
export const createJournalEntry = async (entry: { journal_id: number; exercises_finished: string[] }) => {
  const response = await fetch(`${EXERCISE_API_URL}/entries`, {
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify(entry),
  });
  return response.json();
};

export const fetchJournalEntries = async (journalId: number) => {
  const response = await fetch(`${EXERCISE_API_URL}/journals/${journalId}/entries`, {
    method: 'GET',
    headers: { 'Content-type': 'application/json' },
  });
  return response.json();
};

export const updateJournalEntry = async (updatedEntry: JournalEntry) => {
  const response = await fetch(`${EXERCISE_API_URL}/entries/${updatedEntry.id}`, {
    method: 'PUT',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify(updatedEntry),
  });
  return response.json();
};

export const deleteJournalEntry = async (id: number) => {
  const response = await fetch(`${EXERCISE_API_URL}/entries/${id}`, {
    method: 'DELETE',
    headers: { 'Content-type': 'application/json' },
  });
  return response.json();
};

// Exercises
export const listExercises = async () => {
  const response = await fetch(`${EXERCISE_API_URL}/exercises`, {
    method: 'GET',
    headers: { 'Content-type': 'application/json' },
  });
  return response.json();
};

export const fetchExercises = async (journalEntryId: number) => {
  const response = await fetch(`${EXERCISE_API_URL}/entries/${journalEntryId}/exercises`, {
    method: 'GET',
    headers: { 'Content-type': 'application/json' },
  });
  return response.json();
};

export const createExercise = async (exercise: Exercise) => {
  const response = await fetch(`${EXERCISE_API_URL}/exercises`, {
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify(exercise),
  });
  return response.json();
};

export const fetchExercise = async (id: number) => {
  const response = await fetch(`${EXERCISE_API_URL}/exercises/${id}`, {
    method: 'DELETE',
    headers: { 'Content-type': 'application/json' },
  });
  return response.json();
};

export const updateExercise = async (updatedExercise: Exercise) => {
  const response = await fetch(`${EXERCISE_API_URL}/exercises/${updatedExercise.id}`, {
    method: 'PUT',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify(updatedExercise),
  });
  return response.json();
};
