import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useTable } from 'react-table';
import { Journal, JournalEntry, Exercise } from '../types';
import { Button } from '@mui/material';
import { fetchExercises, createExercise, updateExercise } from '../Requests/Requests';
import { defaultExercise } from '../Defaults/Defaults';

const Styles = styled.div`
  padding: 1rem;

  table {
    width: 100%;
    border-spacing: 0;
    border: 1px solid black;

    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;
      word-wrap: break-word;

      :last-child {
        border-right: 0;
      }

      input {
        text-align: center;
        font-size: 1rem;
        padding: 0;
        margin: 0;
        border: 0;
      }
    }
  }
`;

// Create an editable cell renderer
const EditableCell = ({
  value: initialValue,
  row,
  column: { id },
  updateMyData, // This is a custom function that we supplied to our table instance
}: any) => {
  // We need to keep and update the state of the cell normally
  const [value, setValue] = useState(initialValue);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  // We'll only update the external data when the input is blurred
  const onBlur = () => {
    updateMyData(row, id, value);
  };

  // If the initialValue is changed external, sync it up with our state
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  if (id === 'exercise_sets' || id === 'exercise_repetitions') {
    return (
      <input
        type="number"
        pattern="[0-9]*"
        style={{ width: '100%' }}
        value={value && value !== NaN ? value : ''}
        onChange={onChange}
        onBlur={onBlur}
      />
    );
  }

  return (
    <input style={{ width: '100%' }} value={value && value !== NaN ? value : ''} onChange={onChange} onBlur={onBlur} />
  );
};

// Set our editable cell renderer as the default Cell renderer
const defaultColumn = {
  Cell: EditableCell,
};

// Be sure to pass our updateMyData and the skipPageReset option
function Table({ columns, data, updateMyData }: any) {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data,
    defaultColumn,
    // updateMyData isn't part of the API, but
    // anything we put into these options will
    // automatically be available on the instance.
    // That way we can call this function from our
    // cell renderer

    // @ts-ignore
    updateMyData,
  });

  // Render the UI for your table
  return (
    <>
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps()}>{column.render('Header')}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row, i) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

interface ExerciseTableProps {
  journal: Journal;
  journalEntry: JournalEntry;
  changeJournalEntry: (entry: JournalEntry) => Promise<void>;
  removeJournalEntry: (journalEntryId: number) => void;
}

function ExercisesTable(props: ExerciseTableProps) {
  const { journal, journalEntry, changeJournalEntry, removeJournalEntry } = props;
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [maxSets, setMaxSets] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const loadExercises = async () => {
    if (journalEntry.id) {
      const exercises = await fetchExercises(journalEntry.id);
      setExercises(exercises);
      setMaxSets(Math.max(...exercises.map((e: Exercise) => e.exercise_sets)));
    }
  };

  useEffect(() => {
    loadExercises();
  }, [journal, journalEntry]);

  const changeExercise = async (updatedExercise: Exercise) => {
    try {
      await updateExercise(updatedExercise);
      await loadExercises();
    } catch (error) {
      alert('cant change the exercise at this time');
    }
  };

  const columns = React.useMemo(
    () => [
      {
        Header: 'Exercise',
        accessor: 'exercise_description',
      },
      {
        Header: 'Weight',
        accessor: 'exercise_weight',
      },
      {
        Header: 'Sets',
        accessor: 'exercise_sets',
      },
      {
        Header: 'Reps',
        accessor: 'exercise_repetitions',
      },
    ],
    [exercises]
  );

  // We need to keep the table from resetting the pageIndex when we Update data. So we can keep track of that flag with a ref. When our cell renderer calls updateMyData, we'll use the rowIndex, columnId and new value to update the original data
  const updateMyData = (row: any, columnId: string, value: any) => {
    // We also turn on the flag to not reset the page
    setExercises((old) =>
      old.map((row, index) => {
        //@ts-ignore
        if (index === row.index) {
          return {
            //@ts-ignore
            ...old[row.index],
            [columnId]: value,
          };
        }
        return row;
      })
    );

    switch (columnId) {
      case 'exercise_sets':
        value = value === '' ? 0 : Number.parseInt(value);
        break;
      case 'exercise_repetitions':
        value = value === '' ? 0 : Number.parseInt(value);
        break;
      default:
        break;
    }

    changeExercise(Object.assign(row.original, { [columnId]: value }));
  };

  const addJournalEntryExercise = async (journalEntryId: number) => {
    try {
      const newExercise = await createExercise(defaultExercise(journalEntryId));
      setExercises((prevState) => [...prevState, newExercise]);
    } catch (error) {
      alert('cant add exercises at this time');
    }
  };

  return (
    <Styles>
      <div className="exercise-table-button-group">
        <Button variant="contained" onClick={async () => addJournalEntryExercise(journalEntry.id!!)}>
          Add Exercise
        </Button>
        <Button variant="contained" onClick={() => removeJournalEntry(journalEntry.id!!)}>
          Delete Grouping
        </Button>
      </div>
      <Table columns={columns} data={exercises} updateMyData={updateMyData} />
      <div className="finish-buttons-container">
        {maxSets > 0 &&
          Array.from(Array(maxSets)).map((_, i) => {
            if (journalEntry.exercises_finished && journalEntry.exercises_finished.length > i) {
              if (i === 0) {
                const journalStart = new Date(journal.journal_start).getTime();
                const currentFinished = new Date(journalEntry.exercises_finished[i]).getTime();
                const diffInMilliseconds = currentFinished - journalStart;
                return (
                  <p key={i}>{`${new Date(currentFinished).toLocaleTimeString(navigator.language, {
                    hour: '2-digit',
                    minute: '2-digit',
                  })} +${Math.round(((diffInMilliseconds % 86400000) % 3600000) / 60000)}`}</p>
                );
              }

              if (journalEntry.exercises_finished.length > 0 && i > 0) {
                const previousFinished = new Date(journalEntry.exercises_finished[i - 1]).getTime();
                const currentFinished = new Date(journalEntry.exercises_finished[i]).getTime();
                const diffInMilliseconds = currentFinished - previousFinished;
                return (
                  <p key={i}>{`${new Date(currentFinished).toLocaleTimeString(navigator.language, {
                    hour: '2-digit',
                    minute: '2-digit',
                  })} +${Math.round(((diffInMilliseconds % 86400000) % 3600000) / 60000)}`}</p>
                );
              }
              return (
                <p key={i}>
                  {new Date(journalEntry.exercises_finished[i]).toLocaleTimeString(navigator.language, {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              );
            } else {
              return (
                <Button
                  style={{ border: '1px solid black' }}
                  key={i}
                  onClick={() => {
                    setLoading(true);
                    if (journalEntry.exercises_finished === null) {
                      journalEntry.exercises_finished = [];
                    }
                    journalEntry.exercises_finished.push(new Date().toISOString());
                    changeJournalEntry(journalEntry).then((blah) => {
                      setLoading(false);
                    });
                  }}
                  disabled={loading}
                >
                  FINISH
                </Button>
              );
            }
          })}
      </div>
    </Styles>
  );
}

export default ExercisesTable;
