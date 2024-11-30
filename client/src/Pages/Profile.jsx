import React, { useState, useEffect, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Loader from "../components/Loader";
import Card from "../components/Card";
import SkeletonCard from "../components/SkeletonCard";
import { DeleteConfirmationModal } from "../components/DeleteConfirmationModal";
import UserProfileCard from "../components/UserProfileCard"; // Import the new UserProfileCard component
import UserProfileCardSkeleton from "../components/UserProfileCardSkeleton"; // Import the skeleton loader

const POSTS_PER_PAGE = 12;

const Profile = () => {
  const { user, getAccessTokenSilently } = useAuth0();
  const [userPosts, setUserPosts] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch user information
  const fetchUserInfo = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/v1/user/${encodeURIComponent(user.sub)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setUserInfo(result.data);
      } else {
        console.error("Error fetching user info:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  // Fetch user posts
  const fetchUserPosts = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/v1/post/user/${encodeURIComponent(
          user.sub
        )}?page=${pageNumber}&limit=${POSTS_PER_PAGE}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setUserPosts((prevPosts) => {
          const newPosts = result.data.filter(
            (newPost) => !prevPosts.some((post) => post._id === newPost._id)
          );
          return [...prevPosts, ...newPosts];
        });
        setHasMore(result.hasMore);
      } else {
        console.error("Error fetching user posts:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching user posts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Effect: Fetch user info and posts on mount
  useEffect(() => {
    fetchUserInfo();
    fetchUserPosts(page);
  }, [user, page]);

  // Infinite scrolling handler
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100 &&
      hasMore &&
      !loading
    ) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [hasMore, loading]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Delete post
  const handleDeletePost = async () => {
    try {
      setIsDeleting(true);
      if (!selectedPostId) return;

      const token = await getAccessTokenSilently();
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/v1/post/${selectedPostId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setUserPosts((prevPosts) =>
          prevPosts.filter((post) => post._id !== selectedPostId)
        );
        setIsModalOpen(false);
      } else {
        console.error("Error deleting post:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Open delete confirmation modal
  const handleOpenModal = (postId) => {
    setSelectedPostId(postId);
    setIsModalOpen(true);
  };

  // Close delete confirmation modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPostId(null);
  };

  return (
    <section className="mt-4 max-w-7xl mx-auto bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText min-h-screen p-8 rounded-lg shadow-md transition-colors duration-300 ease-in-out">
      {/* User Profile Card */}
      {userInfo ? (
        <UserProfileCard userInfo={userInfo} auth0User={user} />
      ) : (
        <UserProfileCardSkeleton />
      )}

      <div className="text-center mb-10">
        <p className="text-gray-200 text-lg">
          Below are your created posts. You can manage them here.
        </p>
      </div>

      {loading && page === 1 ? (
        <div className="grid lg:grid-cols-4 sm:grid-cols-3 xs:grid-cols-2 grid-cols-1 gap-6">
          {Array.from({ length: POSTS_PER_PAGE }).map((_, index) => (
            <SkeletonCard key={index} /> 
          ))}
        </div>
      ) : (
        <>
          {userPosts.length ? (
            <div className="grid lg:grid-cols-4 sm:grid-cols-3 xs:grid-cols-2 grid-cols-1 gap-6">
              {userPosts.map((post) => (
                <Card
                  key={post._id}
                  {...post}
                  onDelete={handleOpenModal}
                  isUserProfile={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center mt-10">
              <h2 className="text-gray-100 text-xl">No posts found.</h2>
            </div>
          )}
        </>
      )}

      {loading && page > 1 && (
        <div className="flex justify-center items-center mt-5">
          <Loader /> {/* Show loader for more posts */}
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleDeletePost}
        isDeleting={isDeleting}
      />
    </section>
  );
};

export default Profile;
