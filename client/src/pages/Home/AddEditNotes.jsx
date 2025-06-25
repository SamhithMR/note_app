import React, { useState } from "react";
import { MdClose } from "react-icons/md";
import axiosInstance from "../../utils/axiosInstance";
import { AiOutlineEdit, AiOutlineExpandAlt, AiOutlineHighlight, AiOutlineCopy } from "react-icons/ai";
import { FiSend } from "react-icons/fi";
import { TbReplace } from "react-icons/tb";

function TypingSkeleton() {
  return (
    <div className="typing-dots">
      <span></span>
      <span></span>
      <span></span>
      <style jsx>{`
        .typing-dots {
          display: flex;
          align-items: center;
          justify-content: start;
          height: 35px;
          padding: 0 10px;
          gap: 8px;
        }

        .typing-dots span {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: #555;
          opacity: 0.3;
          animation: bounce 1.2s infinite ease-in-out;
        }

        .typing-dots span:nth-child(1) {
          animation-delay: 0s;
        }
        .typing-dots span:nth-child(2) {
          animation-delay: 0.2s;
        }
        .typing-dots span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.3;
          }
          40% {
            transform: scale(1.4);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}


const AddEditNotes = ({
  noteData,
  type,
  onClose,
  getAllNotes,
  showTokenMessage,
  allNotes
}) => {
  const [title, setTitle] = useState(noteData?.title || "");
  const [content, setContent] = useState(noteData?.content || "");
  const [error, setError] = useState(null);

  const [userPrompt, setUserPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const [hasInteracted, setHasInteracted] = useState(false);

  const addNewNote = async () => {
    try {

      let defaultX = 10;
      let defaultY = 10;
      if (allNotes && allNotes.length > 0) {
        const sortedNotes = [...allNotes].sort((a, b) => a.x - b.x);
        const lastNote = sortedNotes[sortedNotes.length - 1];

        const NOTE_WIDTH = 220;
        const MAX_X = 800;

        defaultX = lastNote.x + NOTE_WIDTH;
        defaultY = lastNote.y;

        if (defaultX > MAX_X) {
          defaultX = 10;
          defaultY += 250;
        }
      }

      const response = await axiosInstance.post("/add-note", {
        title,
        content,
        x: defaultX,
        y: defaultY
      });
      if (response.data && response.data.note) {
        showTokenMessage("Note Added Successfully");
        getAllNotes();
        onClose();
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      }
    }
  };

  const editNote = async () => {
    const noteId = noteData._id;
    try {
      const response = await axiosInstance.put(`/edit-note/${noteId}`, {
        title,
        content
      });
      if (response.data && response.data.note) {
        showTokenMessage("Note Update Successfully");
        getAllNotes();
        onClose();
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      }
    }
  };

  const handleAddNote = () => {
    if (!title) {
      setError("Please enter the Title");
      return;
    }

    if (!content) {
      setError("Please enter the Content");
      return;
    }

    setError("");

    if (type === "edit") {
      editNote();
    } else {
      addNewNote();
    }
  };


  const handleAIEnhancement = async (type) => {
    setLoading(true);
    setResult("");
    setHasInteracted(true);

    try {
      const res = await axiosInstance.post(`/ai-enhance`, {
        type,
        content,
        title,
        userPrompt: type === "custom" ? userPrompt : undefined,
      });

      setResult(res.data.result || "No result returned.");
    } catch (error) {
      console.error("AI Enhancement Error:", error);
      setResult("Error: " + (error.response?.data?.message || "Something went wrong."));
    }

    setLoading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 relative flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          {type === "edit" ? "Edit Note" : "Create New Note"}
        </h2>
        <button
          className=" text-white hover:text-indigo-200 transition-colors"
          onClick={onClose}
        >
          <MdClose className="text-2xl" />
        </button>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <input
            type="text"
            id="title"
            className="w-full text-2xl font-semibold text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 focus:border-indigo-500 focus:ring-0 transition-all duration-300 placeholder-gray-400 outline-none"
            placeholder="Title"
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>

        <div className="mb-4">
          <textarea
            id="content"
            className="w-full text-gray-800 border-2 border-gray-200 rounded-lg focus:border-indigo-500 transition-colors duration-300 outline-none p-3 resize-none"
            placeholder="Take a note..."
            rows={4}
            value={content}
            onChange={({ target }) => setContent(target.value)}
          />
        </div>

        <div className="flex justify-center gap-4 flex-wrap mb-4">
          <button onClick={() => handleAIEnhancement("improve")} className="ai-btn">
            <AiOutlineEdit className="mr-2" /> Fix Grammar
          </button>
          <button onClick={() => handleAIEnhancement("summarize")} className="ai-btn">
            <AiOutlineHighlight className="mr-2" /> Summarize
          </button>
          <button onClick={() => handleAIEnhancement("expand")} className="ai-btn">
            <AiOutlineExpandAlt className="mr-2" /> Add More Details
          </button>
        </div>

        <div className="relative mb-6 w-full md:w-[80%] m-auto">
          <textarea
            rows={1}
            className="resize-none w-full border rounded-3xl px-3 py-2 pr-10 text-sm min-h-[40px] max-h-40 overflow-auto"
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder="Custom AI Prompt: e.g., Translate this note to German"
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
          />
          <button
            onClick={() => handleAIEnhancement("custom")}
            className="absolute bottom-4 right-3 text-indigo-600 hover:text-indigo-800 cursor-pointer"
            disabled={!userPrompt}
          >
            <FiSend size={18} />
          </button>
        </div>

        {hasInteracted && (
          <div className="relative m-4 bg-gray-100 p-4 rounded-md min-h-[100px]">
            {/* Top-right buttons */}
            {!loading && (
              <div className="absolute top-2 right-2 flex gap-2">
                {/* Copy Button */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(result);
                    // Optionally show toast/alert
                  }}
                  title="Copy to Clipboard"
                  className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                >
                  <AiOutlineCopy size={20} />
                </button>

                {/* Set as Note Content */}
                <button
                  onClick={() => setContent(result)}
                  title="Set as Note Content"
                  className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                >
                  <div className="flex flex-col items-center group">
                    <TbReplace size={20} className="text-blue-600 group-hover:text-blue-800" />
                    <span className="text-xs text-gray-600 group-hover:text-blue-800">Replace</span>
                  </div>
                </button>
              </div>
            )}

            {/* Result Content */}
            {loading ? (
              <TypingSkeleton />
            ) : (
              <pre className="whitespace-pre-wrap text-sm text-gray-800 pt-8">{result}</pre>
            )}
          </div>
        )}


        <style jsx>{`
        .ai-btn {
          display: flex;
          align-items: center;
          background-color: transparent;
          color: #4f46e5;
          padding: 0.5rem 1rem;
          border: 1px solid #4f46e5;
          border-radius: 0.5rem;
          font-weight: 600;
          transition: all 0.3s;
        }

        .ai-btn:hover {
          background-color: #4f46e5;
          color: white;
        }

        textarea:disabled {
          opacity: 0.6;
        }
      `}</style>


        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <button
          className="w-fit bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-300 text-lg font-semibold block ml-auto"
          onClick={handleAddNote}
        >
          {type === "edit" ? "Update Note" : "Add Note"}
        </button>
      </div>
    </div>
  );
};
export default AddEditNotes;
