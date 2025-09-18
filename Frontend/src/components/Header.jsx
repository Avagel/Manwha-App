import {
  faFilter,
  faSearch,
  faWindowClose,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef, useState } from "react";

export const Header = ({ setSearch }) => {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const inputRef = useRef(null);

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
        <p className="name">Library</p>
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
