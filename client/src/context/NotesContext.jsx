import { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { io } from "socket.io-client";

const NotesContext = createContext();
const socket = io(`${import.meta.env.VITE_BASE_URL}`);

export const NotesProvider = ({ children }) => {
  const [allNotes, setAllNotes] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get("api/auth/get-user");
      if (response.data?.user) {
        setUserInfo(response.data.user);
        setIsLoggedIn(true);
      }
    } catch (error) {
      setIsLoggedIn(false);
      localStorage.clear();
    }
  };

  const getAllNotes = async () => {
    if (!isLoggedIn) return;
    try {
      const response = await axiosInstance.get("api/notes/");
      if (response.data?.notes) {
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      console.error("Error fetching notes", error);
    }
  };

  // 🚀 Main fix: Wait for token before calling getUserInfo
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getUserInfo(); // call only if token exists
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) getAllNotes();
  }, [isLoggedIn]);

  useEffect(() => {
    socket.on("note-updated-from-server", (updatedNote) => {
      setAllNotes((prevNotes) =>
        prevNotes.map((note) =>
          note._id === updatedNote._id ? { ...note, ...updatedNote } : note
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

  return (
    <NotesContext.Provider
      value={{
        allNotes,
        setAllNotes,
        getAllNotes,
        userInfo,
        isLoggedIn,
        getUserInfo,
        socket,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => useContext(NotesContext);
