import { useState } from "react";
import { FaUserFriends, FaImage, FaMoneyBillWave, FaTrophy, FaCrown } from "react-icons/fa";
import UserProfileCardSkeleton from "./UserProfileCardSkeleton";
import { UserCircleIcon } from "@heroicons/react/24/outline";

const UserProfileCard = ({ userInfo, auth0User, getAccessTokenSilently }) => {

  const [flipped, setFlipped] = useState(false);

  if (!userInfo || !auth0User) {
    return <UserProfileCardSkeleton />;
  }

  const { followers, following, postCount, credits, name, profilePicture, userId } = userInfo;

  const myProfile = JSON.parse(localStorage.getItem("myProfile"));

  let isFollowing = userInfo.followers.includes(myProfile.userId);

  const handleFollow = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/v1/user/${userId}/follow`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ followerUserId: auth0User.sub, followerUsername: myProfile.username   }),
        });

      if (response.ok) {
        // Reload the page 
        window.location.reload();
      }
    }
    catch (error) {
      console.error("Error following user:", error);
    }
  }
  const handleUnfollow = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/v1/user/${userId}/unfollow`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ unfollowerUserId: auth0User.sub }),
        });

      if (response.ok) {
        // Reload the page 
        window.location.reload();
      }
    }
    catch (error) {
      console.error("Error unfollowing user:", error);
    }
  }

  return (
    <div className="flex justify-center items-center p-4 drop-shadow-2xl">
      <style>
        {`
          .card {
            perspective: 1000px;
            
          }
          .card-inner {
            position: relative;
            width: 100%;
            height: 100%;
            transition: transform 0.6s;
            transform-style: preserve-3d;
          }
          .card-front{
            position: absolute;
            backface-visibility: hidden;
          }
          .card-back {
            transform: rotateY(180deg);
            backface-visibility: hidden;
          }
          .card.flipped .card-inner {
            transform: rotateY(180deg);
          }
        `}
      </style>
      <div className={`w-full max-w-2xl card ${flipped ? 'flipped' : ''}`}>

        <div className="card-inner">

          <div className="card-front relative border-b-4 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl">
            <FaTrophy className="absolute top-4 right-4 z-10 text-yellow-500 dark:text-yellow-400 text-lg sm:text-xl" onClick={() => setFlipped(!flipped)} />
            <div className="relative rounded-xl w-full h-auto p-6 flex flex-col sm:flex-row items-center sm:items-start">
              {/* Profile Picture */}
              <div className="flex-shrink-0 mb-4 sm:mb-0 sm:w-1/4 sm:h-full">
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-2 border-purple-500 shadow-md object-cover transition-transform hover:scale-110"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/150?text=No+Image";
                  }}
                />
              </div>

              {/* User Info */}
              <div className="mt-4 sm:mt-0 sm:ml-8 flex-1 text-center sm:text-left">
                <h2 className="text-xl sm:text-3xl text-purple-700 font-bold break-words dark:text-white">{name}</h2>

                {/* Metrics */}
                <div className="flex justify-center sm:justify-start gap-6 sm:gap-8 mt-6 flex-wrap">
                  <div className="flex flex-col items-center text-gray-900 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-transform hover:scale-105">
                    <div className="flex items-center gap-1">
                      <FaUserFriends className="text-blue-500 dark:text-blue-400 text-lg sm:text-xl" />
                      <span className="font-bold">{followers ? followers.length : 0}</span>
                    </div>
                    <span className="text-xs sm:text-sm">Followers</span>
                  </div>

                  <div className="flex flex-col items-center text-gray-900 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 transition-transform hover:scale-105">
                    <div className="flex items-center gap-1">
                      <FaUserFriends className="text-green-500 dark:text-green-400 text-lg sm:text-xl" />
                      <span className="font-bold">{following ? following.length : 0}</span>
                    </div>
                    <span className="text-xs sm:text-sm">Following</span>
                  </div>

                  <div className="flex flex-col items-center text-gray-900 dark:text-gray-300 hover:text-purple-500 dark:hover:text-purple-400 transition-transform hover:scale-105">
                    <div className="flex items-center gap-1">
                      <FaImage className="text-purple-500 dark:text-purple-400 text-lg sm:text-xl" />
                      <span className="font-bold">{postCount || 0}</span>
                    </div>
                    <span className="text-xs sm:text-sm">Posts</span>
                  </div>
                  {auth0User.username === userInfo.username &&
                    <div className="flex flex-col items-center text-gray-900 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-400 transition-transform hover:scale-105">
                      <div className="flex items-center gap-1">
                        <FaMoneyBillWave className="text-yellow-500 dark:text-yellow-400 text-lg sm:text-xl" />
                        <span className="font-bold">{credits || 0}</span>
                      </div>
                      <span className="text-xs sm:text-sm">Credits</span>
                    </div>}
                  {myProfile.username !== userInfo.username && userInfo.followers && !isFollowing &&
                    <button
                      onClick={handleFollow}
                      className="flex items-center gap-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300"
                    >
                      <FaUserFriends className="text-white" />
                      Follow
                    </button>
                  }
                  {myProfile.username !== userInfo.username && userInfo.followers && isFollowing &&
                    <button
                      onClick={handleUnfollow}
                      className="flex items-center gap-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300"
                    >
                      <FaUserFriends className="text-white" />
                      Unfollow
                    </button>
                  }
                </div>
              </div>
            </div>
          </div>

          {/* back start */}
          <div className="card-back fixed flex justify-center items-center bg-gray-200 dark:bg-gray-700 rounded-2xl w-full max-w-2xl">
            {profilePicture ?
              <img src={profilePicture} alt="Profile" className="absolute top-4 right-4 w-7 h-7 rounded-full z-10" onClick={() => setFlipped(!flipped)} /> :
              <UserCircleIcon className="absolute top-4 right-4 z-10 text-black dark:text-white text-lg sm:text-xl w-7 h-7" onClick={() => setFlipped(!flipped)} />}
            <div className="relative rounded-xl w-full h-auto p-6 flex flex-col sm:flex-row items-center sm:items-start">
              {/* Profile Picture */}
              <div className="flex-shrink-0 mb-4 sm:mb-0 sm:w-1/4 sm:h-full">
                <FaTrophy className="text-yellow-500 dark:text-yellow-400 text-lg sm:text-xl size-28" />
              </div>

              {/* User Info */}
              <div className="mt-4 sm:mt-0 sm:ml-8 flex-1 text-center sm:text-left">
                <h2 className="text-xl sm:text-3xl text-purple-700 font-bold break-words dark:text-white">Contest Info</h2>

                {/* Metrics */}
                <div className="flex justify-center sm:justify-start gap-6 sm:gap-8 mt-6 flex-wrap">
                  <div className="flex flex-col items-center text-gray-900 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-transform hover:scale-105">
                    <div className="flex items-center gap-1">
                      <FaCrown className="text-red-500 dark:text-red-400 text-lg sm:text-xl" />
                      <span className="font-bold">{userInfo.contest ?? 0}</span>
                    </div>
                    <span className="text-xs sm:text-sm">Contest Won</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* back end */}
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard;
