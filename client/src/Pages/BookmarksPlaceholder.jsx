// Pages/BookmarksPlaceholder.jsx
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useQuery } from '@tanstack/react-query';
import Card from '../components/Card';
import Loader from '../components/Loader';

const BookmarksPage = () => {
  const { user, isAuthenticated, loginWithRedirect } = useAuth0();

  const { data, isLoading } = useQuery({
    queryKey: ['bookmarks', user?.sub],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/v1/post/bookmarks/${user?.sub}`);
      if (!response.ok) throw new Error('Failed to fetch bookmarks');
      return response.json();
    },
    enabled: !!user?.sub,
  });

  if (!isAuthenticated) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold mb-4">Sign in to view your bookmarks</h2>
        <button
          onClick={() => loginWithRedirect()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (isLoading) return <Loader />;

  const bookmarks = data?.data || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-6">Your Bookmarks</h1>
      {bookmarks.length === 0 ? (
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold mb-2">No bookmarks yet</h2>
          <p className="text-gray-600">Save interesting posts to see them later!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((post) => (
            <Card
              key={post._id}
              {...post}
              isBookmarked={true}
              onBookmark={() => {/* Handle unbookmark */}}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BookmarksPage;