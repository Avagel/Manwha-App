import { faFilter, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const Header = () => {
  return (
    <div className="header">
      <p className="name">Library</p>
      <div className="sort">
        <FontAwesomeIcon icon={faSearch} />
        <FontAwesomeIcon icon={faFilter} />
      </div>
    </div>
  );
};
