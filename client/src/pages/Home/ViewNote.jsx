import React from 'react';
import { MdClose } from "react-icons/md";
import { AiOutlineCopy } from "react-icons/ai";

const ViewNote = ({ noteData, onClose }) => {
  if (!noteData) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(noteData.content);
    alert('Note content copied to clipboard!');
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-5 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 break-all">{noteData.title}</h2>
        <div className="flex gap-2">
          <button onClick={handleCopy} className="p-2 text-gray-600 hover:text-black rounded">
            <AiOutlineCopy size={20} />
          </button>
          <button onClick={onClose} className="p-2 text-red-600 hover:text-red-700 rounded">
            <MdClose size={20} />
          </button>
        </div>
      </div>
      <div className="p-5 bg-gray-100 rounded-lg min-h-[150px]">
        <p className="text-gray-700 text-base leading-relaxed m-0 break-all">{noteData.content}</p>
      </div>
    </div>
  );
};

export default ViewNote;
