import {
  faBackward,
  faCaretLeft,
  faFilter,
  faSearch,
  faUser,
  faWindowClose,
  faXmarkCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef, useState } from "react";
import { useNavigate } from "react-router";

export const Header = ({ setSearch, val, handleSearch }) => {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isUserSeen, setIsUserSeen] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const handleSearchClick = () => {
    console.log("Search icon clicked");

    if (isSearchActive) setSearch("");
    setIsSearchActive(!isSearchActive);
  };
  const handleChange = (e) => {
    setSearch(e.target.value.toLocaleLowerCase());
  };
  window.addEventListener("keydown", (e) => {
    if (e.key == "Escape") {
      setIsSearchActive(false);
      setSearch("");
    }
  });
  const goBack = () => {
    navigate(-1);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (val == "Discover") {
      const search = inputRef.current.value.trim();
      if (search == "") return;
      search.replace(" ", "%20");
      handleSearch(search);
      inputRef.current.value = "";
    } else {
      return;
    }
  };
  const UUID = localStorage.getItem("manhwaUUID");

  return (
    <div className="header">
      <div className="uuid" hidden={!isUserSeen}>
        UUID: {UUID}
      </div>

      {isSearchActive ? (
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for Manwha"
            onChange={handleChange}
            autoFocus
          />
          <FontAwesomeIcon icon={faXmarkCircle} onClick={handleSearchClick} />
        </form>
      ) : (
        <p className="name">
          {val == "back" ? (
            <FontAwesomeIcon icon={faCaretLeft} onClick={goBack} />
          ) : (
            val
          )}
        </p>
      )}

      <div className="sort">
        {isSearchActive ? (
          ""
        ) : (
          <FontAwesomeIcon
            icon={faSearch}
            hidden={!isSearchActive}
            onClick={handleSearchClick}
          />
        )}
        <FontAwesomeIcon
          icon={faUser}
          onClick={() => {
            setIsUserSeen((prev) => !prev);
          }}
        />
      </div>
    </div>
  );
};
