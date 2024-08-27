import React from "react";
import AdminHome from "@/pages/homePage/AdminHomePage"; // Assume you have this component
import UserHome from "@/pages/homePage/UserHomePage"; // Assume you have this component

interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  token: string;
}

const Homepage: React.FC = () => {
  const getUserFromLocalStorage = (): User | null => {
    try {
      const userString = localStorage.getItem("user");
      if (!userString) return null;
      return JSON.parse(userString) as User;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  };

  const user = getUserFromLocalStorage();

  if (!user) {
    // Handle case where user is not logged in
    return <div>Please log in to view this page.</div>;
  }

  return <div>{user.isAdmin ? <AdminHome /> : <UserHome />}</div>;
};

export default Homepage;
