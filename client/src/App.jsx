// App.jsx
import React from "react";
import { Route, Routes } from "react-router-dom";
import { Home, CreatePost, Profile, PostDetail, OtherProfile } from "./Pages";
import PrivateRoute from "./Pages/PrivateRoute";
import CustomNavbar from "./components/CustomNavbar";
import { useTheme } from "./context/ThemeContext";
import { UserProvider } from "./context/UserContext";
import BookmarksPlaceholder from "./Pages/BookmarksPlaceholder";
import NotFound from "./Pages/NotFound";
import AdminLogin from "./Pages/Admin/AdminLogin";
import AdminDashboard from "./Pages/Admin/AdminDashboard";
import AdminContests from "./Pages/Admin/AdminContests";
import AdminCreateContest from "./Pages/Admin/AdminCreateContest";
import AdminEditContest from "./Pages/Admin/AdminEditContest";
import AdminContestDetails from "./Pages/Admin/AdminContestDetails";
import AdminRoute from "./Pages/Admin/AdminRoute";
import Contests from "./Pages/Contests/Contests";
import ContestDetail from "./Pages/Contests/ContestDetail";
import MyContestEntries from "./Pages/Contests/MyContestEntries";
import Notifications from './Pages/Notifications';

function App() {
  const { isDarkMode } = useTheme();

  return (
    <div
      className={`${
        isDarkMode ? "dark" : ""
      } min-h-screen bg-gray-50 dark:bg-gray-900`}
    >
      <UserProvider>
        <CustomNavbar />
        <div className="lg:ml-24 p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/create-post"
              element={
                <PrivateRoute>
                  <CreatePost />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/user/profile"
              element={
                <PrivateRoute>
                  <OtherProfile />
                </PrivateRoute>
              }
            />
            <Route
              path="/notifications"
              element={<Notifications />}
            />
            <Route path="/bookmarks" element={<BookmarksPlaceholder />} />
            <Route path="/post/:id" element={<PostDetail />} />

            {/* Contest Routes */}
            <Route path="/contests" element={<Contests />} />
            <Route path="/contests/:id" element={<ContestDetail />} />
            <Route
              path="/contests/myentries"
              element={
                <PrivateRoute>
                  <MyContestEntries />
                </PrivateRoute>
              }
            />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/contests"
              element={
                <AdminRoute>
                  <AdminContests />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/contests/create"
              element={
                <AdminRoute>
                  <AdminCreateContest />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/contests/edit/:id"
              element={
                <AdminRoute>
                  <AdminEditContest />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/contests/:id"
              element={
                <AdminRoute>
                  <AdminContestDetails />
                </AdminRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </UserProvider>
    </div>
  );
}

export default App;
