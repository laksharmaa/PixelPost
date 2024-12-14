// App.jsx
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Home, CreatePost, Profile, PostDetail } from './Pages';
import PrivateRoute from './Pages/PrivateRoute';
import CustomNavbar from "./components/CustomNavbar";
import { useTheme } from './context/ThemeContext';
import NotificationsPlaceholder from './Pages/NotificationsPlaceholder';
import BookmarksPlaceholder from './Pages/BookmarksPlaceholder';
import NotFound from './Pages/NotFound';

function App() {
  const { isDarkMode } = useTheme();

  return (
    <div className={`${isDarkMode ? 'dark' : ''} min-h-screen bg-gray-50 dark:bg-gray-900`}>
      <CustomNavbar />
      <div className="lg:ml-24 p-4">
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
          <Route path="/notifications" element={<NotificationsPlaceholder />} />
          <Route path="/bookmarks" element={<BookmarksPlaceholder />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;