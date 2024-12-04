import React from "react";
import { FaUserFriends, FaImage } from "react-icons/fa";
import UserProfileCardSkeleton from "./UserProfileCardSkeleton";

const UserProfileCard = ({ userInfo, auth0User }) => {
  if (!userInfo || !auth0User) {
    return <UserProfileCardSkeleton />;
  }

  const { followers, following, postCount } = userInfo;
  const { name, picture } = auth0User;

  return (
    <div className="flex justify-center items-center p-4 drop-shadow-2xl">
      <div className="relative border-b-4 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl">
        <div className="relative rounded-xl w-full h-auto p-6 flex flex-col sm:flex-row items-center sm:items-start">
          {/* Profile Picture */}
          <div className="flex-shrink-0 mb-4 sm:mb-0 sm:w-1/4 sm:h-full">
            <img
              src={picture}
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
              <div className="flex flex-col items-center text-gray-900 dark:text-gray-300 hover:text-purple-500 dark:hover:text-purple-400 transition-transform hover:scale-105">
                <div className="flex items-center gap-1">
                  <FaUserFriends className="text-blue-500 dark:text-blue-400 text-lg sm:text-xl" />
                  <span className="font-bold">{followers ? followers.length : 0}</span>
                </div>
                <span className="text-xs sm:text-sm">Followers</span>
              </div>

              <div className="flex flex-col items-center text-gray-900 dark:text-gray-300 hover:text-purple-500 dark:hover:text-purple-400 transition-transform hover:scale-105">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard;
