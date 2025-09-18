import { NavLink, Outlet } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faHistory,
  faCompass,
} from "@fortawesome/free-solid-svg-icons";
import { Header } from "../components/Header";

export const Layout = () => {
  return (
    <>
    
      <Outlet />
      <nav>
        <NavLink to="/">
          <FontAwesomeIcon icon={faBook} />
          Library
        </NavLink>
        <NavLink to="history">
          <FontAwesomeIcon icon={faHistory} />
          History
        </NavLink>
        <NavLink to="discover">
          <FontAwesomeIcon icon={faCompass} />
          Discover
        </NavLink>
      </nav>
    </>
  );
};
