import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Symptoms from './pages/Symptoms';
import FamilyGuide from './pages/FamilyGuide';
import Psychological from './pages/Psychological';
import Resources from './pages/Resources';
import WishList from './pages/WishList';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/symptoms" element={<Symptoms />} />
        <Route path="/family" element={<FamilyGuide />} />
        <Route path="/psychological" element={<Psychological />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/wishlist" element={<WishList />} />
      </Routes>
    </Router>
  );
}

export default App;
