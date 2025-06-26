import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import { MdAdd, MdVisibility } from "react-icons/md";
import AddEditNotes from "./AddEditNotes";
import Modal from "react-modal";
import ViewNote from "./ViewNote";
import axiosInstance from "../../utils/axiosInstance";
import Toast from "../../components/ToastMessage/Toast";
import EmptyCard from "../../components/EmptyCard/EmptyCard";
import AddNoteImg from "../../assets/images/add-note.svg";
import NoDataImg from "../../assets/images/no-data.svg";
import { useNotes } from "../../context/NotesContext";

import ReactFlow, {
  Background,
  Controls,
  MiniMap,
} from "reactflow";
import "reactflow/dist/style.css";
import NoteNode from "../../components/Cards/NoteNode";

const nodeTypes = {
  noteNode: NoteNode,
};


const Home = () => {
  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });
  const [openViewModal, setOpenViewModal] = useState({
    isShown: false,
    data: null,
  });

  const [showTokenMsg, setShowTokenMsg] = useState({
    isShown: false,
    message: "",
    type: "add",
  });
  const { allNotes, setAllNotes, getAllNotes, userInfo, isLoggedIn, getUserInfo, socket } = useNotes();
  const [isSearch, setIsSearch] = useState(false);

  const nodes = allNotes.map((note) => ({
    id: note._id,
    type: "noteNode",
    position: { x: note.x || 0, y: note.y || 0 },
    data: {
      ...note,
      onEdit: () => handleEdit(note),
      onView: () => handleView(note),
      onDelete: () => deleteNote(note),
    },
  }));


  const handleEdit = (noteDetails) => {
    if (!isLoggedIn) {
      alert("Please log in to edit notes.");
      return;
    }
    setOpenAddEditModal({ isShown: true, data: noteDetails, type: "edit" });
  };

  const handleView = (noteDetails) => {
    if (!isLoggedIn) {
      alert("Please log in to edit notes.");
      return;
    }
    setOpenViewModal({ isShown: true, data: noteDetails });
  };

  const showTokenMessage = (message, type) => {
    setShowTokenMsg({
      isShown: true,
      message,
      type,
    });
  };

  const handleCloseToast = () => {
    setShowTokenMsg({
      isShown: false,
      message: "",
    });
  };


  const deleteNote = async (data) => {
    if (!isLoggedIn) {
      alert("Please log in to delete notes.");
      return;
    }
    const noteId = data._id;
    try {
      const response = await axiosInstance.delete(`api/notes/${noteId}`);
      if (response.data && !response.data.error) {
        showTokenMessage("Note Deleted Successfully", "delete");
        socket.emit("note-deleted", noteId);
        getAllNotes();
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        console.log("An unexpected error occurred. Please try again.");
      }
    }
  };

  const onSearchNotes = async (query) => {
    if (!isLoggedIn) return;
    try {
      const response = await axiosInstance.get("api/notes/search", {
        params: { query },
      });
      if (response.data && response.data.notes) {
        setIsSearch(true);
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleClearSearch = () => {
    setIsSearch(false);
    getAllNotes();
  };

  const handleAddNote = () => {
    if (!isLoggedIn) {
      alert("Please log in to add notes.");
      return;
    }
    setOpenAddEditModal({ isShown: true, type: "add", data: null });
  };

  useEffect(() => {
    getUserInfo();
    socket.on("note-updated-from-server", (updatedNotes) => {
      setAllNotes((prevNotes) =>
        prevNotes.map((note) =>
          note._id === updatedNotes._id ? { ...note, ...updatedNotes } : note
        )
      );
    });

    socket.on("note-deleted-from-server", (noteId) => {
      setAllNotes((prevNotes) => prevNotes.filter((note) => note._id !== noteId));
    });

    return () => {
      socket.off("note-updated-from-server");
      socket.off("note-deleted-from-server");
    };

  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      getAllNotes();
      getUserInfo()
    }
  }, [isLoggedIn]);

  const handleDragStop = async (noteId, position) => {

    socket.emit("note-updated", {
      _id: noteId,
      x: position.x,
      y: position.y
    });

    const updatedNotes = allNotes.map(note =>
      note._id === noteId ? { ...note, x: position.x, y: position.y } : note
    );
    setAllNotes(updatedNotes);

    try {
      await axiosInstance.put(`api/notes/position/${noteId}`, {
        x: position.x,
        y: position.y,
      });
    } catch (err) {
      console.error("Error updating position", err);
    }
  };


  return (
    <div className="min-h-screen bg-gray-100">
      <div className="sticky top-0 z-10 bg-white shadow">
        <Navbar
          userInfo={userInfo}
          onSearchNotes={onSearchNotes}
          handleClearSearch={handleClearSearch}
        />
      </div>

      <main className="p-4 mx-auto">
        {isLoggedIn ? (
          allNotes.length > 0 ? (
            <div className="w-full h-[90vh] rounded-md border bg-white">
              <ReactFlow
                nodes={nodes}
                edges={[]}
                nodeTypes={nodeTypes}
                fitView
                onNodeDragStop={(event, node) => handleDragStop(node.id, node.position)}
              >
                <MiniMap />
                <Controls />
                <Background />
              </ReactFlow>
            </div>

          ) : (
            <div className="flex justify-center items-center h-fit">
              <EmptyCard
                imgSrc={isSearch ? NoDataImg : AddNoteImg}
                message={
                  isSearch
                    ? `Oops! No notes found matching your search.`
                    : `Start creating your first note! Click the 'Add' button to jot down your thoughts, ideas, and reminders. Let's get started!`
                }
              />
            </div>
          )
        ) : (
          <div className="flex justify-center items-center h-fit">
            <EmptyCard
              imgSrc={AddNoteImg}
              message="Welcome! Please log in to view and manage your notes."
            />
          </div>
        )}
      </main>

      <button
        className="fixed right-6 bottom-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors duration-300"
        onClick={handleAddNote}
      >
        <MdAdd className="text-3xl" />
      </button>

      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={() =>
          setOpenAddEditModal({ isShown: false, type: "add", data: null })
        }
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
          content: {
            top: "55%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            padding: "0",
            border: "none",
            borderRadius: "0.5rem",
            maxWidth: "90%",
            width: "800px",
          },
        }}
        contentLabel="Add/Edit Note"
      >
        <AddEditNotes
          type={openAddEditModal.type}
          noteData={openAddEditModal.data}
          onClose={() => {
            setOpenAddEditModal({ isShown: false, type: "add", data: null });
          }}
          showTokenMessage={showTokenMessage}
        />
      </Modal>

      <Modal
        isOpen={openViewModal.isShown}
        onRequestClose={() => {
          setOpenViewModal({ isShown: false, data: null });
        }}
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
          content: {
            top: "55%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            padding: "0",
            border: "none",
            borderRadius: "0.5rem",
            maxWidth: "90%",
            width: "800px",
          },
        }}
        contentLabel="View Note"
      >
        <ViewNote
          noteData={openViewModal.data}
          onClose={() => {
            setOpenViewModal({ isShown: false, data: null });
          }}
        />
      </Modal>

      <Toast
        isShown={showTokenMsg.isShown}
        message={showTokenMsg.message}
        type={showTokenMsg.type}
        onClose={handleCloseToast}
      />
    </div>
  );
};

export default Home;
