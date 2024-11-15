import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Home, CreatePost, Profile, PostDetail } from './Pages';
import PrivateRoute from './Pages/PrivateRoute';
import CustomNavbar from "./components/CustomNavbar"; // New Navbar
import { useTheme } from './context/ThemeContext';

function App() {
  const { isDarkMode } = useTheme();

  return (
    <div className={`${isDarkMode ? 'dark' : ''} min-h-screen`}>
      <CustomNavbar />
      <main className="sm:p-8 px-4 py-8 w-full min-h-[calc(100vh-73px)] bg-slate-200 dark:bg-gray-800 text-lightText dark:text-darkText">
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
          <Route path="/post/:id" element={<PostDetail />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
