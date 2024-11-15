import React from 'react';

const FormField = ({ labelName, type, name, placeholder, value, handleChange, isSurpriseMe, handleSurpriseMe }) => {
  return (
    <div>
      <div className='flex items-center gap-2 mb-2'>
        <label
          htmlFor={name}
          className='block text-sm font-medium text-white'
        >
          {labelName}
        </label>
        {isSurpriseMe && (
          <button
            type="button"
            onClick={handleSurpriseMe}
            className='font-semibold text-xs bg-[#EcECF1] py-1 px-2 rounded-[5px] text-black'
          >
            Surprise Me
          </button>
        )}
      </div>
      <input
        type={type}
        id={name}
        name={name}
        className="transition-colors duration-300 ease-in-out
    bg-lightInput dark:bg-darkInput 
    border border-gray-300 dark:border-gray-700 
    text-lightText dark:text-darkText 
    text-sm rounded-lg 
    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
    outline-none block w-full p-3"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        required
      />


    </div>
  );
}

export default FormField;
