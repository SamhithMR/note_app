import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Toast from "../../components/ToastMessage/Toast";

const Home = () => {

  const [userInfo, setUserInfo] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [showTokenMsg, setShowTokenMsg] = useState({
    isShown: false,
    message: "",
    type: "add",
  });

  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get("/get-user");
      if (response.data && response.data.user) {
        setUserInfo(response.data.user);
        setIsLoggedIn(true);
      }
    } catch (error) {
      setIsLoggedIn(false);
      if (error.response && error.response.status === 401) {
        localStorage.clear();
      }
    }
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

  
  useEffect(() => {
    getUserInfo();
  }, []);


  return (
    <div className="min-h-screen bg-gray-100">
      <div className="sticky top-0 z-10 bg-white shadow">
        <Navbar
          userInfo={userInfo}
        />
      </div>

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
