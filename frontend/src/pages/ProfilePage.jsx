import React, { useState } from "react";
import Header from "../components/Layout/Header";
import styles from "../styles/styles";
import ProfileSidebar from "../components/Profile/ProfileSidebar";
import ProfileContent from "../components/Profile/ProfileContent";
import { useSelector } from "react-redux";
import Loader from "../components/Layout/Loader";
import { Navigate } from "react-router-dom";

const ProfilePage = () => {
  const { loading, isAuthenticated, user } = useSelector((state) => state.user);
  const [active, setActive] = useState(1);

  if (loading) {
    return <Loader />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <Header />
      <div className={`${styles.section} flex bg-[#f5f5f5] py-10`}>
        <div className="w-[50px] 800px:w-[335px] sticky 800px:mt-0 mt-[18%]">
          <ProfileSidebar active={active} setActive={setActive} />
        </div>
        <div className="w-full 800px:w-[60%] 800px:mt-0 mt-[18%]">
          <ProfileContent active={active} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;