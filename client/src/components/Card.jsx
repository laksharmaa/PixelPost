import React from 'react';
import { Link } from 'react-router-dom';
import download from '../assets/download.png';
import { downloadImage } from '../utils';

const Card = ({ _id, name, prompt, photo }) => {
  return (
    <div className="rounded-xl group relative shadow-card transition-all duration-300 
      hover:shadow-lg hover:shadow-violet-400 hover:scale-[1.02] card">
      <Link to={`/post/${_id}`} className="block">
        <img
          className="w-full h-auto object-cover rounded-lg transition-transform duration-300 hover:scale-105"
          src={photo}
          alt={prompt}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
          <p className="text-white text-xs sm:text-sm leading-tight mb-2 truncate">{prompt}</p>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white font-medium">
                {name[0]}
              </div>
              <p className="text-white text-sm font-medium">{name}</p>
            </div>
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
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Card;
