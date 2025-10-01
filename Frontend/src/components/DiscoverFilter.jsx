import {
  faArrowDown,
  faCaretDown,
  faCaretUp,
  faChevronCircleDown,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

export const DiscoverFilter = ({ handleFilter }) => {
  const genres = [
    "Action",
    "Adaptation",
    "Adult",
    "Adventure",
    "Another chance",
    "Apocalypse",
    "Comedy",
    "Coming Soon",
    "Crazy MC",
    "Cultivation",
    "Cute",
    "Demon",
    "Drama",
    "Dungeons",
    "Ecchi",
    "Fantasy",
    "Fight",
    "Game",
    "Genius",
    "Genius MC",
    "Harem",
    "Hero",
    "Historical",
    "Isekai",
    "Josei",
    "Kool Kids",
    "Magic",
    "Martial Arts",
    "Mature",
    "Mecha",
    "Modern Setting",
    "Monsters",
    "Murim",
    "Mystery",
    "Necromancer",
    "Noble",
    "Overpowered",
    "Pets",
    "Post-Apocalyptic",
    "Psychological",
    "Rebirth",
    "Regression",
    "Reincarnation",
    "Return",
    "Returned",
    "Returner",
    "Revenge",
    "Romance",
    "School",
    "School Life",
    "Sci-fi",
    "Seinen",
    "Shoujo",
    "Shounen",
    "Slice of Life",
    "Sports",
    "Super Hero",
    "Superhero",
    "Supernatural",
    "Survival",
    "Suspense",
    "System",
    "Thriller",
    "Time Travel",
    "Time Travel (Future)",
    "Tower",
    "Tragedy",
    "Transmigrating",
    "Video Game",
    "Video Games",
    "Villain",
    "Violence",
    "Virtual Game",
    "Virtual Reality",
    "Virtual World",
    "Webtoon",
    "Wuxia",
  ];
  const statuses = [
    "All",
    "Ongoing",
    "Hiatus",
    "Completed",
    "Dropped",
    "Season End",
    "Coming Soon",
  ];
  const types = ["All", "Manhwa", "Manhua", "Manga", "Mangatoon"];
  const sortOptions = [
    "Last Updated",
    "Rating",
    "Bookmark Count",
    "Name (Z-A)",
    "Name (A-Z)",
  ];

  const [genreIsOpen, setgenreIsOpen] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState([]);

  const [statusIsOpen, setStatusIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(-1);

  const [selectedType, setSelectedType] = useState(-1);
  const [typeIsOpen, setTypeIsOpen] = useState(false);

  const [selectedSort, setSelectedSort] = useState("Last Updated");
  const [sortIsOpen, setSortIsOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleChangeGenre = (genre) => {
    genre = genres.indexOf(genre) + 1;

    setSelectedGenre(
      (prev) =>
        prev.includes(genre)
          ? prev.filter((g) => g !== genre) // remove if already selected
          : [...prev, genre] // add if not selected
    );
  };

  return (
    <div className="filter">
      <div className="group">
        <button
          className="filt"
          onClick={() => {
            setgenreIsOpen((prev) => !prev);
          }}
        >
          Genres
          <FontAwesomeIcon icon={genreIsOpen ? faCaretUp : faCaretDown} />
        </button>
        <div className={genreIsOpen ? "content" : "content hidden"}>
          {genres.map((genre) => {
            return (
              <label>
                {" "}
                <input
                  type="checkbox"
                  onChange={() => {
                    handleChangeGenre(genre);
                  }}
                />{" "}
                {genre}{" "}
              </label>
            );
          })}
        </div>
      </div>
      <div className="group">
        <button
          className="filt"
          onClick={() => {
            setTypeIsOpen((prev) => !prev);
          }}
        >
          Type
          <FontAwesomeIcon icon={typeIsOpen ? faCaretUp : faCaretDown} />
        </button>
        <div className={typeIsOpen ? "content" : "content hidden"}>
          {types.map((status) => (
            <label
              key={status}
              style={{ display: "block", marginBottom: "6px" }}
            >
              <input
                type="radio"
                name="type"
                value={status}
                checked={selectedType === types.indexOf(status) - 1}
                onChange={() => setSelectedType(types.indexOf(status) - 1)}
              />
              {status}
            </label>
          ))}
        </div>
      </div>
      <div className="group">
        <button
          className="filt"
          onClick={() => {
            setStatusIsOpen((prev) => !prev);
          }}
        >
          Status
        <FontAwesomeIcon icon={statusIsOpen ? faCaretUp : faCaretDown} />
        </button>
        <div className={statusIsOpen ? "content" : "content hidden"}>
          {statuses.map((status) => (
            <label
              key={status}
              style={{ display: "block", marginBottom: "6px" }}
            >
              <input
                type="radio"
                name="status"
                value={status}
                checked={selectedStatus === statuses.indexOf(status) - 1}
                onChange={() => setSelectedStatus(statuses.indexOf(status) - 1)}
              />
              {status}
            </label>
          ))}
        </div>
      </div>

      <div className="group">
        <button
          className="filt"
          onClick={() => {
            setSortIsOpen((prev) => !prev);
          }}
        >
          Sort
        <FontAwesomeIcon icon={sortIsOpen ? faCaretUp : faCaretDown} />
        </button>
        <div className={sortIsOpen ? "content" : "content hidden"}>
          {sortOptions.map((status) => (
            <label
              key={status}
              style={{ display: "block", marginBottom: "6px" }}
            >
              <input
                type="radio"
                name="sort"
                value={status}
                checked={selectedSort === status}
                onChange={() => setSelectedSort(status)}
              />
              {status}
            </label>
          ))}
        </div>
      </div>

      <button
        className="search"
        onClick={() => {
          handleFilter([
            selectedGenre,
            selectedType,
            selectedStatus,
            selectedSort,
          ]);
        }}
      >
        Search
      </button>
    </div>
  );
};
