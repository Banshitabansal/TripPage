import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Xyz from './components/xyz';
import TripPage from './components/TripPage';
import TripPage2 from './components/TripPage2';


function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path= "/xyz" element={<Xyz/>}/>
          <Route path= "/TripPage" element={<TripPage/>}/>
          <Route path= "/TripPage2" element={<TripPage2/>}/>
        </Routes>
      </Router>
    </>
  );
}
export default App;
