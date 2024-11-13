import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import Loader from '../components/Loader';
import Card from '../components/Card';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, getAccessTokenSilently } = useAuth0();
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserPosts = async () => {
    try {
      if (!user) return;

      const token = await getAccessTokenSilently();
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/v1/user-post/user-posts/${encodeURIComponent(user.sub)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();

        // Filter unique posts based on `_id`
        const uniquePosts = result.data.reduce((acc, post) => {
          if (!acc.some((p) => p._id === post._id)) {
            acc.push(post);
          }
          return acc;
        }, []);

        setUserPosts(uniquePosts);
      } else {
        console.error('Error fetching user posts:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPosts();
  }, [user]);

  return (
    <section className='max-w-7xl mx-auto bg-gray-900 text-white min-h-screen p-8'>
      <h1 className='font-extrabold text-white text-[32px]'>My Profile</h1>

      {loading ? (
        <Loader />
      ) : (
        <div className='grid lg:grid-cols-4 sm:grid-cols-3 xs:grid-cols-2 grid-cols-1 gap-3'>
          {userPosts.length ? (
            userPosts.map((post) => (
              <Link key={post._id} to={`/post/${post._id}`}>
                <Card {...post} />
              </Link>
            ))
          ) : (
            <h2 className='text-white'>No posts found.</h2>
          )}
        </div>
      )}
    </section>
  );
};

export default Profile;
