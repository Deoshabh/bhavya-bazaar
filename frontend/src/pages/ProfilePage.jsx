import React, { useState, useEffect } from "react";
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
  const [authCheckComplete, setAuthCheckComplete] = useState(false);

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading && !isAuthenticated && !user) {
        console.log('⚠️ ProfilePage: Auth check timeout, assuming not authenticated');
        setAuthCheckComplete(true);
      }
    }, 5000); // 5 second timeout

    // If we have a definitive auth state, clear the timer
    if (!loading || isAuthenticated || user) {
      setAuthCheckComplete(true);
      clearTimeout(timer);
    }

    return () => clearTimeout(timer);
  }, [loading, isAuthenticated, user]);

  // Show loading while auth is being checked, but not indefinitely
  if (loading && !authCheckComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader />
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated and auth check is complete
  if (!loading && !isAuthenticated && authCheckComplete) {
    console.log('🔄 ProfilePage: Redirecting to login - not authenticated');
    return <Navigate to="/login" replace />;
  }

  // If we're still loading but auth check is complete, assume logged out
  if (loading && authCheckComplete && !isAuthenticated) {
    return <Navigate to="/login" replace />;
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