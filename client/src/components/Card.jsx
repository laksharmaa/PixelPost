import React from 'react';
import download from '../assets/download.png';
import { downloadImage } from '../utils';

const Card = ({ _id, name, prompt, photo }) => {
  return (
    <div className="rounded-xl group relative shadow-card hover:shadow-cardhover card">
      {/* Image */}
      <img
        className="w-full h-auto object-cover rounded-lg"
        src={photo}
        alt={prompt}
      />

      {/* Overlay Content */}
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 hover:opacity-100 bottom-0 left-0 right-0 transition-opacity duration-300 p-4 flex flex-col justify-end">
        <p className="text-white text-xs sm:text-sm leading-tight mb-2 truncate">{prompt}</p>
        <div className="flex justify-between items-center">
          {/* User Info */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white font-medium">
              {name[0]}
            </div>
            <p className="text-white text-sm font-medium">{name}</p>
          </div>

          {/* Download Button */}
          <button
            type="button"
            onClick={() => downloadImage(_id, photo)}
            className="outline-none bg-transparent p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors duration-300"
          >
            <img src={download} alt="download" className="w-5 h-5 object-contain invert" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Card;
