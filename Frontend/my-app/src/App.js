import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TripPage from './Pages/TripPage';
import TripPage2 from './Pages/TripPage2';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path= "/TripPage" element={<TripPage/>}/>
          <Route path= "/TripPage2" element={<TripPage2/>}/>
        </Routes>
      </Router>
    </>
  );
}
export default App;
