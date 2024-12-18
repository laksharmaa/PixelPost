// Card.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react"; // Add this import
import download from "../assets/download.png";
import DeleteTwoToneIcon from "@mui/icons-material/DeleteTwoTone";
import { BookmarkIcon as BookmarkOutline } from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolid } from "@heroicons/react/24/solid";
import { downloadImage } from "../utils";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";

const Card = ({ _id, name, prompt, photo, onDelete, isUserProfile, isBookmarked, onBookmark }) => {
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const [localIsBookmarked, setLocalIsBookmarked] = useState(isBookmarked);
  const [isModalOpen, setIsModalOpen] = useState(false); // Add this state
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setLocalIsBookmarked(isBookmarked);
  }, [isBookmarked]);

  // Add handleDeleteClick function
  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  };

  // Add handleConfirmDelete function
  const handleConfirmDelete = () => {
    onDelete(_id);
    setIsModalOpen(false);
  };

  const handleBookmarkClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      loginWithRedirect({
        appState: { returnTo: window.location.pathname },
      });
      return;
    }
    
    setLocalIsBookmarked(!localIsBookmarked);
    onBookmark(_id);
  };


  return (
    <div className="shadow-lg rounded-xl group relative shadow-card transition-all duration-300 hover:shadow-lg hover:shadow-violet-400 hover:scale-[1.02] card">
      <Link to={`/post/${_id}`} className="block">
        <img
          className="w-full h-auto object-cover rounded-lg transition-transform duration-300 hover:scale-105"
          src={photo}
          alt={prompt}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end rounded-md">
          <p className="text-white text-xs sm:text-sm leading-tight mb-2 truncate">{prompt}</p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white font-medium">
              {name[0]}
            </div>
            <p className="text-white text-sm font-medium">{name}</p>
          </div>
        </div>
      </Link>

      <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={handleBookmarkClick}
          className="outline-none bg-transparent p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors duration-300"
        >
          {localIsBookmarked ? (
            <BookmarkSolid className="w-5 h-5 text-blue-500" />
          ) : (
            <BookmarkOutline className="w-5 h-5 text-white" />
          )}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            downloadImage(_id, photo);
          }}
          className="outline-none bg-transparent p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors duration-300"
        >
          <img src={download} alt="download" className="w-5 h-5 object-contain invert" />
        </button>
         {isUserProfile && (
        <button
          type="button"
          onClick={handleDeleteClick} // Now this is defined
          className="outline-none bg-transparent p-1 rounded-full hover:bg-red-600 hover:text-white transition-colors duration-300"
        >
          <DeleteTwoToneIcon fontSize="small" />
        </button>
      )}
      </div>
      {isModalOpen && (
        <DeleteConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
};

export default Card;