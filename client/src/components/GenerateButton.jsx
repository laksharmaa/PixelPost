import React from 'react';
// import './GenerateButton.css'; // Assuming you place the CSS in this file

const GenerateButton = ({ onClick, generating }) => {
  return (
    <button
      className="group cursor-pointer relative cursor-default w-[120px] h-[60px] bg-[linear-gradient(144deg,_#af40ff,_#5b42f3_50%,_#00ddeb)] text-white whitespace-nowrap flex flex-wrap rounded-lg overflow-hidden"
      onClick={onClick}
      disabled={generating}
    >
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
        {generating ? 'Generating...' : 'Generate'}
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
