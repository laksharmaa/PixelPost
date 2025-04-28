import React from 'react';
import { RiCoinLine } from 'react-icons/ri';

const GenerateButton = ({ onClick, generating, credits }) => {
  const isDisabled = generating || credits === 0;
  
  return (
    <button
      className={`group relative w-[120px] h-[60px] bg-[linear-gradient(144deg,_#af40ff,_#5b42f3_50%,_#00ddeb)] text-white whitespace-nowrap flex flex-wrap rounded-lg overflow-hidden ${
        isDisabled ? 'opacity-70' : ''
      }`}
      onClick={onClick}
      disabled={isDisabled}
    >
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
        {generating ? 'Generating...' : (
          <div className="flex items-center gap-1">
            <span>Generate</span>
            {credits !== undefined && (
              <span className="flex items-center text-xs">
                <RiCoinLine className="inline mr-[1px]" />1
              </span>
            )}
          </div>
        )}
      </span>
      {[...Array(64)].map((_, index) => (
        <div
          key={index}
          className={`w-[10px] h-[10px] blur-[5px] bg-[rgb(30,41,59)] delay-[0.2s] duration-[0.4s] hover:bg-transparent hover:delay-0 hover:duration-0 group-focus:bg-transparent`}
        ></div>
      ))}
    </button>
  );
};

export default GenerateButton;
