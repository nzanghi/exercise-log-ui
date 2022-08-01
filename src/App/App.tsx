import './app.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Journals from '../Journals/Journals';
import ExerciseCatalog from '../ExerciseCatalog/ExerciseCatalog';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Journals />} />
          <Route path="/exercises" element={<ExerciseCatalog />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
