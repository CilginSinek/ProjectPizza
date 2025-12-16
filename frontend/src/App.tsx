import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Register from './pages/Register';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        {/* TODO: Add more routes (login, dashboard, etc.) */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
