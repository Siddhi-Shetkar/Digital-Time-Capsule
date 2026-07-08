import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateCapsule from './pages/CreateCapsule';
import PublicGallery from './pages/PublicGallery';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/gallery" element={<PublicGallery />} />
              <Route path="/public-gallery" element={<PublicGallery />} />
              
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/create" element={<CreateCapsule />} />
              </Route>
            </Routes>
          </main>
          <Toaster position="bottom-right" toastOptions={{
            style: {
              background: '#1A233A',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)'
            }
          }} />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
