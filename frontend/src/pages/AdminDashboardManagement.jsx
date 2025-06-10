import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import AdminManagement from "../components/Admin/AdminManagement";

const AdminDashboardManagement = () => {
  return (
    <div>
      <AdminHeader />
      <div className="flex items-start justify-between w-full">
        <div className="w-[80px] 800px:w-[330px]">
          <AdminSideBar active={9} />
        </div>
        <AdminManagement />
      </div>
    </div>
  );
};

export default AdminDashboardManagement;
