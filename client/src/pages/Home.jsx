import React from "react";
import { useAuthStore } from "../store/useAuthStore";

const Home = () => {
  const { onlineUsers } = useAuthStore;
  return (
    <></>
    // <div className="flex items-center justify-center mt-20">
    //   {onlineUsers.length}
    // </div>
  );
};

export default Home;
