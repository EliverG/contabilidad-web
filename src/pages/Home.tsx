import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";

export default function Home() {
  return (
    <>
      <NavBar />
      <div className="container mt-4 mx-auto px-4">
        <Outlet />
      </div>
    </>
  );
}