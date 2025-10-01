import { NavLink, Outlet, useLocation } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faHistory,
  faCompass,
  faAdd,
  faPlusCircle,
  faMinusCircle,
} from "@fortawesome/free-solid-svg-icons";
import { Header } from "../components/Header";
import { useState } from "react";
import axios from "axios";

export const Layout = ({ libraryData, setLibraryData }) => {
  const location = useLocation();
  const { pathname } = location;
  const [error, setError] = useState(null);
  const isReading = location.pathname.includes("/series");
  console.log(isReading);
  const API_URL = import.meta.env.VITE_API_URL;

  console.log(location);

  const checkIfExist = (link) => {
    if (!link) return false;

    const check = libraryData?.filter((item) => item.link == link) || [];
    console.log("Check", check);

    if (check.length > 0) return true;

    return false;
  };
  const addToLibrary = async () => {
    const { data } = location.state;
    const uuid = localStorage.getItem("manhwaUUID");
    console.log("Data to Add:", data);
    if (checkIfExist(data.link)) return;

    try {
      const res = await axios.post(`${API_URL}/library/add`, {
        UUID: uuid,
        data,
      });
      const result = res.data;
      console.log("Added", result);

      setLibraryData((prev) => {
        return [...prev, data];
      });
    } catch (error) {
      setError(error);
    }
  };
  const removeFromLibrary = async () => {
    const uuid = localStorage.getItem("manhwaUUID");
    const { data } = location.state;
    const { link } = data;

    console.log("Data to remove:", data);
    if (!checkIfExist(data.link)) return;
    try {
      const res = await axios.post(`${API_URL}/library/remove`, {
        UUID: uuid,
        link,
      });
      const result = res.data;
      console.log("Added", result);

      setLibraryData((prev) => {
        return prev.filter((manwha) => manwha.link !== data.link);
      });
    } catch (error) {
      setError(error);
    }
  };

  return (
    <>
      <Outlet />
      <nav className={isReading ? "hidden" : ""}>
        <NavLink to="/">
          <FontAwesomeIcon icon={faBook} />
          Library
        </NavLink>
        <NavLink to="history">
          <FontAwesomeIcon icon={faHistory} />
          History
        </NavLink>
        {pathname.includes("/overview") && location.state ? (
          <div>
            {checkIfExist(location.state.data.link) ? (
              <>
                <button onClick={removeFromLibrary}>
                  <FontAwesomeIcon icon={faMinusCircle} color="tomato" />
                  Remove
                </button>
              </>
            ) : (
              <>
                <button onClick={addToLibrary}>
                  <FontAwesomeIcon icon={faPlusCircle} color="lime" />
                  Add
                </button>
              </>
            )}
          </div>
        ) : (
          <NavLink to="discover">
            <FontAwesomeIcon icon={faCompass} />
            Discover
          </NavLink>
        )}
      </nav>
    </>
  );
};

/*
  after fetching the data, i want to cache so that is the page is reloaded it will not fetch again unless refreshed
  how will i accomplish this?
   I. up lift the state; than check if the object exists; if the does, get the data from there else fetch it then save it

   II. learn a third party cahing service that will do this same thing ( probaly redis).

  things left to do 
   I. add remove from library functionality
   II. add history functionality (both adding and removing from history)
   III. add reding controls 
   IV. add search functionality
   V. add filter functionality and full naviigation



  Adding reading controls.
  when the user taps the screen at the centre part, a transluscent controller pops over the UI

  some of the controls to add
  -- see current chapter
  -- ability to go to the previous or next chapter
  -- ability to go back to the overview page.
  
  Adding search functionality for discover
  when a user searches in the discover page, it queries both the current data and also the Api
  note that this will be debounced. since each manhwa doesn't have an ID, the link will be used as an identifier
   how will i implement this
   i will add a new tab for filter. this filter tab will display whenever a user searches.

  Adding filter functionality 
  self explanatory; just add a bunch of buttons and render based on if they are true false or contain a value.

  things to research;
  

*/
