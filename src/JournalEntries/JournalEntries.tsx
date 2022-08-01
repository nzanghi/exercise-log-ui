import { useState, useEffect, useCallback } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import { FormControl, InputLabel, MenuItem, Select, Button } from '@mui/material';
import './journal-entry.css';
import { useDebounce } from '../Hooks/CustomHooks';
import {
  createJournalEntry,
  fetchJournalEntries,
  deleteJournalEntry,
  updateJournalEntry,
  createJournal,
  updateJournal,
  createExercise,
  fetchExercises,
} from '../Requests/Requests';
import ExercisesTable from './ExercisesTable';

import { defaultJournalEntry } from '../Defaults/Defaults';
import { Journal, JournalEntry, Exercise } from '../types';

interface JournalEntryProps {
  journal: Journal;
  removeJournal: (journal: Journal) => void;
  changeJournal: (journal: Journal) => void;
  loadJournals: () => void;
}

export default function JournalEntries(props: JournalEntryProps) {
  const { journal, removeJournal, changeJournal, loadJournals } = props;
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [journalNotes, setJournalNotes] = useState<string>('');
  const debouncedJournalNotes = useDebounce(journalNotes, 200);

  useEffect(() => {
    if (journal.notes) {
      setJournalNotes(journal.notes);
    }
  }, []);

  const loadJournalEntries = useCallback(async () => {
    setJournalEntries(await fetchJournalEntries(journal.id));
  }, [journal]);

  useEffect(() => {
    loadJournalEntries();
  }, [loadJournalEntries]);

  useEffect(() => {
    journal.notes = journalNotes;
    updateJournal(journal);
  }, [debouncedJournalNotes]);

  const addJournalEntry = async () => {
    try {
      const newJournalEntry = await createJournalEntry(defaultJournalEntry(journal.id));
      newJournalEntry.exercises_finished = [];
      setJournalEntries((prevState) => [...prevState, newJournalEntry]);
    } catch (error) {
      alert('cant add the journal entry at this time');
    }
  };

  const removeJournalEntry = async (journalEntryId: number) => {
    if (window.confirm('delete this entire exercise group?')) {
      try {
        await deleteJournalEntry(journalEntryId);
        setJournalEntries((prevState) => [...prevState.filter((journalEntry) => journalEntry.id !== journalEntryId)]);
      } catch (error) {
        alert('cant delete the journal entry at this time');
      }
    }
  };

  const changeJournalEntry = async (updatedEntry: JournalEntry) => {
    try {
      await updateJournalEntry(updatedEntry);
      if (updatedEntry.exercises_finished.length > 0) {
        journal.journal_finish = updatedEntry.exercises_finished[updatedEntry.exercises_finished.length - 1];
        await changeJournal(journal);
      }
      // TODO: do some state change here
      await loadJournalEntries();
    } catch (error) {
      alert('cant change the journal entry at this time');
    }
  };

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const getDateAndDay = (dateString: string) => {
    let d = new Date(dateString);
    return `${d.toLocaleDateString()} ${days[d.getDay()]}`;
  };

  const getLocaleTimeString = (dateString: string) => {
    let d = new Date(dateString);
    return `${d.toLocaleTimeString(navigator.language, {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  // TODO: move this server side, this is a bunch of network that don't need to be made
  // send journal_entry_ids to a method to do all this
  const copyJournal = useCallback(async () => {
    if (window.confirm('want to copy this workout to today?')) {
      const newJournal: Journal = await createJournal(journal.author);
      newJournal.muscle_group = journal.muscle_group;
      await updateJournal(newJournal);
      for (const entry of journalEntries) {
        const newJournalEntry = await createJournalEntry(defaultJournalEntry(newJournal.id));
        const previousExercises = await fetchExercises(entry.id);
        for (const exercise of previousExercises) {
          exercise.journal_entry_id = newJournalEntry.id;
          delete exercise.id;
          const newExercise = await createExercise(exercise);
          console.debug(`created exercise with id ${newExercise.id}`);
        }
      }
      loadJournals();
    }
  }, [journalEntries]);

  return (
    <div className="journal-entry">
      <Accordion>
        <div onClick={() => loadJournalEntries()}>
          <Button variant="contained" style={{ display: 'inline-block' }} onClick={async () => copyJournal()}>
            Copy
          </Button>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
            <Typography>{`${getDateAndDay(journal.entry_date)} ${
              journal.journal_start ? getLocaleTimeString(journal.journal_start) : ''
            }`}</Typography>
          </AccordionSummary>
        </div>
        <AccordionDetails>
          <div style={{ marginBottom: '20px' }}>
            {journal.journal_start ? (
              <p>
                {new Date(journal.journal_start).toLocaleTimeString(navigator.language, {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            ) : (
              <Button
                variant="contained"
                onClick={async () => {
                  journal.journal_start = new Date().toISOString();
                  await changeJournal(journal);
                }}
              >
                Start
              </Button>
            )}
          </div>
          <FormControl style={{ width: '200px' }}>
            <InputLabel>Muscle Group</InputLabel>
            <Select
              labelId="muscle-group-select-label"
              id="muscle-group-select"
              value={journal.muscle_group}
              label="Muscle Group"
              onChange={async (e) => {
                journal.muscle_group = e.target.value;
                await changeJournal(journal);
              }}
            >
              <MenuItem value={'push'}>Push</MenuItem>
              <MenuItem value={'pull'}>Pull</MenuItem>
              <MenuItem value={'legs'}>Legs</MenuItem>
            </Select>
          </FormControl>
          <div style={{ marginTop: '10px' }}>
            <Button variant="contained" onClick={async () => addJournalEntry()}>
              Add Exercise Group
            </Button>
          </div>
          {journalEntries.map((entry, i) => (
            <ExercisesTable
              key={i}
              journal={journal}
              journalEntry={entry}
              changeJournalEntry={changeJournalEntry}
              removeJournalEntry={removeJournalEntry}
            />
          ))}
          <Accordion style={{ width: '100%', margin: '20px 0 20px' }}>
            <AccordionSummary style={{ backgroundColor: '#1565c0', color: 'white' }}>
              <span style={{ margin: '0 auto' }}>Workout Notes</span>
            </AccordionSummary>
            <AccordionDetails style={{ display: 'flex' }}>
              <textarea
                onChange={(e) => setJournalNotes(e.target.value)}
                style={{ width: '100%', minHeight: '150px' }}
                value={journalNotes}
              />
            </AccordionDetails>
          </Accordion>
        </AccordionDetails>
        <Button className="journal-delete-button" onClick={() => removeJournal(journal)}>
          <DeleteIcon />
        </Button>
      </Accordion>
    </div>
  );
}
