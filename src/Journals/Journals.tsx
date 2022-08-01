import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from '../Hooks/CustomHooks';
import './journal.css';
import Button from '@mui/material/Button';
import JournalEntries from '../JournalEntries/JournalEntries';
import { TextField } from '@mui/material';

import { createJournal, deleteJournal, fetchJournalsWithAuthor, updateJournal } from '../Requests/Requests';

import { Journal } from '../types';

function Journals() {
  const [author, setAuthor] = useLocalStorage('author', '');
  const [journals, setJournals] = useState<Journal[]>([]);

  const loadJournals = useCallback(async () => {
    setJournals(await fetchJournalsWithAuthor(author));
  }, [author]);

  useEffect(() => {
    if (author.length > 3) {
      loadJournals();
    }
  }, [author.length, loadJournals]);

  const addJournal = async (author: string) => {
    try {
      const journal = await createJournal(author);
      setJournals((prevState) => [journal, ...prevState]);
    } catch (error) {
      alert('cant add a journal at this time');
    }
  };

  const removeJournal = async (journal: Journal) => {
    if (window.confirm('delete entire journal?')) {
      try {
        await deleteJournal(journal.id);
        setJournals((prevState) => [...prevState.filter((j) => j.id !== journal.id)]);
        alert(`delete was successful`);
      } catch (error) {
        alert('cant delete the journal at this time');
      }
    }
  };

  const changeJournal = async (updatedJournal: Journal) => {
    try {
      const journal = await updateJournal(updatedJournal);
      await loadJournals();
      console.debug(`updated journal ${journal.id}`);
    } catch (error) {
      alert('cant update the journal at this time');
    }
  };

  return (
    <div className="journal">
      <header className="journal-header">
        <TextField
          className="journal-author-input"
          placeholder={localStorage.getItem('author') ?? 'author'}
          onChange={(e) => setAuthor(e.target.value.toLowerCase())}
        ></TextField>
        <Button
          className="journal-add-button"
          variant="contained"
          onClick={() => addJournal(author)}
          disabled={author.length < 3}
        >
          Add an Entry
        </Button>
      </header>
      {journals.map((journal) => (
        <JournalEntries
          key={journal.id}
          journal={journal}
          removeJournal={removeJournal}
          changeJournal={changeJournal}
          loadJournals={loadJournals}
        />
      ))}
    </div>
  );
}

export default Journals;
