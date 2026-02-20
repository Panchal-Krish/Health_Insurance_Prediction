// import Header from "./components/Header";
// import Home from "./pages/Home";

// function App() {
//   return (
//     <>
//       <Header />
//       <Home />
//     </>
//   );
// }

// export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Contact from './pages/Contact';
import Predict from './pages/Predict';


import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/diseases" element={<div className="page-placeholder">Diseases Page</div>} />
            <Route path="/ai-analysis" element={<div className="page-placeholder">AI Analysis Page</div>} />
            <Route path="/how-it-works" element={<div className="page-placeholder">How it Works Page</div>} />
            <Route path="/about" element={<div className="page-placeholder">About Us Page</div>} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<div className="page-placeholder">Privacy Policy</div>} />
            <Route path="/terms-of-service" element={<div className="page-placeholder">Terms of Service</div>} />
            <Route path="/predict" element={<Predict />} />
            
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;