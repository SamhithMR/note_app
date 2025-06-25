import React from "react";
import { MdEdit, MdDelete, MdVisibility } from "react-icons/md";
import { FaRobot } from "react-icons/fa";
import { Tooltip } from "react-tooltip";

const IconButton = ({ icon: Icon, onClick, label, color }) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-${color}-500 transition`}
    aria-label={label}
    data-tooltip-id={label}
  >
    <Icon size={18} className={`text-${color}-600`} />
    <Tooltip id={label} place="top" content={label} />
  </button>
);

const NoteCard = ({ title, date, content, onEdit, onView, onDelete, onAI }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow duration-300 flex flex-col h-full min-w-[250px]">
      <div className="p-4 flex-grow">
        <div className="flex justify-between items-start">
          <h3 className="text-md font-semibold text-gray-900 truncate">
            {title}
          </h3>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {new Date(date).toLocaleDateString()}
        </p>
        <p className="text-sm text-gray-700 mt-3 line-clamp-3">{content}</p>
      </div>
      <div className="bg-gray-50 border-t px-3 py-2 flex justify-between items-center">
        <div className="flex space-x-2">
          <IconButton icon={MdEdit} onClick={onEdit} label="Edit" color="blue" />
          <IconButton icon={MdVisibility} onClick={onView} label="View" color="gray" />
        </div>
          <IconButton icon={MdDelete} onClick={onDelete} label="Delete" color="red" />
      </div>
    </div>
  );
};

export default NoteCard;
