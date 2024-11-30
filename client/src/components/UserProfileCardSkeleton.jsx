import React from 'react';
import { FaUserFriends, FaImage } from 'react-icons/fa';

const UserProfileCardSkeleton = () => {
  return (
    <div className="flex justify-center items-center p-4 drop-shadow-2xl">
      <div className="relative border-b-4 border-gray-700 bg-gray-800 rounded-2xl w-full max-w-2xl shadow-lg">
        <div className="relative rounded-xl w-full h-auto p-6 flex flex-col sm:flex-row items-center sm:items-start">
          {/* Skeleton for Profile Image */}
          <div className="flex-shrink-0 mb-4 sm:mb-0 sm:w-1/4 sm:h-full">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-500 animate-pulse" />
          </div>

          {/* Skeleton for User Info */}
          <div className="mt-4 sm:mt-0 sm:ml-8 flex-1 text-center sm:text-left">
            <div className="w-32 h-6 bg-gray-500 rounded-full animate-pulse mb-2" />
            <div className="w-40 h-4 bg-gray-500 rounded-full animate-pulse mb-4" />
            
            {/* Skeleton for Metrics */}
            <div className="flex justify-center sm:justify-start gap-6 sm:gap-8 mt-6 flex-wrap">
              <div className="flex flex-col items-center hover:text-purple-500 transition-transform hover:scale-105">
                <div className="w-12 h-4 bg-gray-500 rounded-full animate-pulse mb-2" />
                <div className="w-20 h-5 bg-gray-500 rounded-full animate-pulse" />
              </div>

              <div className="flex flex-col items-center hover:text-purple-500 transition-transform hover:scale-105">
                <div className="w-12 h-4 bg-gray-500 rounded-full animate-pulse mb-2" />
                <div className="w-20 h-5 bg-gray-500 rounded-full animate-pulse" />
              </div>

              <div className="flex flex-col items-center hover:text-purple-500 transition-transform hover:scale-105">
                <div className="w-12 h-4 bg-gray-500 rounded-full animate-pulse mb-2" />
                <div className="w-20 h-5 bg-gray-500 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileCardSkeleton;
