import React from "react";
import { MdEdit, MdDelete } from "react-icons/md";

const NoteCard = ({
  title,
  date,
  content,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full min-w-[200px]">
      <div className="p-4 flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800 truncate flex-grow pr-2">
            {title}
          </h3>
        </div>
        <p className="text-sm text-gray-600 mb-2">
          {new Date(date).toLocaleDateString()}
        </p>
        <p className="text-gray-700 mb-4 line-clamp-3">{content}</p>
      </div>
      <div className="bg-gray-50 px-4 py-3 flex justify-end space-x-2 mt-auto">
        <button
          onClick={onEdit}
          className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
        >
          <MdEdit size={24} />
        </button>
        <button
          onClick={onDelete}
          className="text-red-600 hover:text-red-800 transition-colors duration-200"
        >
          <MdDelete size={24} />
        </button>
      </div>
    </div>
  );
};

export default NoteCard;