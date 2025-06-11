import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import AdminSettings from "../components/Admin/AdminSettings";

const AdminSettingsPage = () => {
  return (
    <div>
      <AdminHeader />
      <div className="flex items-start justify-between w-full">
        <div className="w-[80px] 800px:w-[330px]">
          <AdminSideBar active={8} />
        </div>
        <AdminSettings />
      </div>
    </div>
  );
};

export default AdminSettingsPage;
