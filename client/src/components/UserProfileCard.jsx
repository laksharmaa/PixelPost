import React from "react";
import { FaUserFriends, FaImage } from "react-icons/fa";

const UserProfileCard = ({ userInfo, auth0User }) => {
  if (!userInfo || !auth0User) {
    return <div className="flex justify-center items-center">Loading...</div>;
  }

  const { followers, following, postCount } = userInfo;
  const { name, picture, email } = auth0User;

  return (
    <div className="flex justify-center items-center p-4">
      <div className="relative bg-gradient-to-r from-purple-400 to-purple-200 shadow-lg shadow-purple-500/50 rounded-2xl max-w-4xl w-full p-8">
        {/* Profile Picture */}
        <div className="absolute -top-12 left-8 transform">
          <img
            src={picture}
            alt="Profile picture"
            className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover transition-transform hover:scale-105"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/150?text=No+Image";
            }}
          />
        </div>

        {/* User Information */}
        <div className="ml-40">
          <h2 className="text-3xl font-bold text-gray-800">{name}</h2>
          <p className="text-gray-600 font-medium mt-1">{email}</p>

          <div className="flex justify-start gap-12 mt-6">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1">
                <FaUserFriends className="text-blue-500 text-xl" />
                <span className="font-bold text-gray-800">{followers || 0}</span>
              </div>
              <span className="text-gray-600 text-sm">Followers</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1">
                <FaUserFriends className="text-green-500 text-xl" />
                <span className="font-bold text-gray-800">{following || 0}</span>
              </div>
              <span className="text-gray-600 text-sm">Following</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1">
                <FaImage className="text-purple-500 text-xl" />
                <span className="font-bold text-gray-800">{postCount || 0}</span>
              </div>
              <span className="text-gray-600 text-sm">Posts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard;
