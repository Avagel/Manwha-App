import {
  faBackward,
  faFilter,
  faSearch,
  faWindowClose,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef, useState } from "react";
import { useNavigate } from "react-router";

export const Header = ({ setSearch, val }) => {
  const [isSearchActive, setIsSearchActive] = useState(false);
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
  const goBack = ()=>{
    navigate(-1)

  }

  return (
    <div className="header">
      {isSearchActive ? (
        <input
          ref={inputRef}
          type="text"
          placeholder="Search for Manwha"
          onChange={handleChange}
          autoFocus
        />
      ) : (
        <p className="name">
          {val == "back" ? <FontAwesomeIcon icon={faBackward} onClick={goBack} /> : val}
        </p>
      )}

      <div className="sort">
        <FontAwesomeIcon
          icon={isSearchActive ? faWindowClose : faSearch}
          onClick={handleSearchClick}
        />
        <FontAwesomeIcon icon={faFilter} />
      </div>
    </div>
  );
};
