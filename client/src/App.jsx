import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Home, CreatePost, Profile } from './Pages';
import PrivateRoute from './Pages/PrivateRoute';
import Header from './components/Header'; // Import the Header component

function App() {
  return (
    <>
      <Header /> {/* Use the Header component here */}
      <main className='sm:p-8 px-4 py-8 w-full bg-gray-800 text-white min-h-[calc(100vh-73px)]'>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create-post" element={
            <PrivateRoute>
              <CreatePost />
            </PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
        </Routes>
      </main>
    </>
  );
}

export default App;
