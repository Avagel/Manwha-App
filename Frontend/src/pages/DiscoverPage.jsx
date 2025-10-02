import { Header } from "../components/Header";
import { NavLink } from "react-router";
import { ManwhaCard } from "../components/ManhwaCard";
import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import { LoadingCard } from "../components/LoadingCard";
import axios from "axios";
import sadtear from "../assets/sadtear.svg";
import { DiscoverFilter } from "../components/DiscoverFilter";

export const DiscoverPage = ({
  latest = [], // Default value
  setLatest,
  popular = [], // Default value
  setPopular,
  setManwhaData,
  current,
  setCurrent,
  filter = [], // Default value
  setFilter,
}) => {
  const [error, setError] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"; // Use VITE_ prefix for Vite

  // Safe data selection with defaults
  const data = current === "latest" ? latest || [] : popular || [];
  const dummy = Array(6).fill(null); // Better dummy array

  useEffect(() => {
    if (!popular?.length) {
      fetchPopular();
    }
  }, []);

  useEffect(() => {
    if (!latest?.length) {
      fetchLatest();
    }
  }, []);

  const fetchPopular = async () => {
    try {
      const res = await axios.get(`${API_URL}/manhwa/popular`);
      setPopular(res.data || []); // Ensure array
    } catch (error) {
      console.error("Fetch popular error:", error);
      setError(error.message);
      setPopular([]); // Set empty array on error
    }
  };

  const fetchLatest = async () => {
    try {
      const res = await axios.get(`${API_URL}/manhwa/latest`);
      setLatest(res.data || []); // Ensure array
    } catch (error) {
      console.error("Fetch latest error:", error);
      setError(error.message);
      setLatest([]); // Set empty array on error
    }
  };

  const handleFilter = async (selectedFilters) => {
    setCurrent("filter");
    setFilterOpen(false);
    setLoading(true);

    let [genres, type, status, order] = selectedFilters;

    if (!genres?.length) {
      genres = "0";
    } else {
      genres = genres.join("%2C");
    }

    switch (order) {
      case "Last Updated":
        order = "update";
        break;
      case "Rating":
        order = "rating";
        break;
      case "Bookmark Count":
        order = "bookmarks";
        break;
      case "Name (Z-A)":
        order = "desc";
        break;
      case "Name (A-Z)":
        order = "asc";
        break;
      default:
        order = "update";
    }

    try {
      const res = await axios.post(`${API_URL}/manhwa/filter`, {
        genre: genres,
        type,
        status,
        order,
      });
      setFilter(res.data || []); // Ensure array
    } catch (error) {
      console.error("Filter error:", error);
      setError(error.message);
      setFilter([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (search) => {
    setLoading(true);
    setCurrent("filter");
    try {
      const res = await axios.post(`${API_URL}/manhwa/search`, { search });
      setFilter(res.data || []); // Ensure array
    } catch (error) {
      console.error("Search error:", error);
      setError(error.message);
      setFilter([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Safe rendering functions
  const renderFilterContent = () => {
    if (loading) return <Loader />;

    if (!filter?.length) {
      return (
        <div className="none">
          <img src={sadtear} alt="No results" />
          <p>No Manhwa Found</p>
        </div>
      );
    }

    return filter.map((item, index) => (
      <ManwhaCard
        key={item?.link || item?.title || `filter-${index}`}
        data={item}
      />
    ));
  };

  const renderMainContent = () => {
    if (!data?.length) {
      return dummy.map((_, index) => <LoadingCard key={`loading-${index}`} />);
    }

    return data.map((item, index) => (
      <ManwhaCard
        key={item?.link || item?.title || `data-${index}`}
        data={item}
      />
    ));
  };

  return (
    <div className="discover-page page">
      <Header
        setSearch={setSearch}
        val={"Discover"}
        handleSearch={handleSearch}
      />

      <div className="discover-nav">
        <button
          className={current === "latest" ? "active" : ""}
          onClick={() => setCurrent("latest")}
        >
          Latest
        </button>
        <button
          className={current === "popular" ? "active" : ""}
          onClick={() => setCurrent("popular")}
        >
          Popular
        </button>
        <button
          onClick={() => setFilterOpen((prev) => !prev)}
          className={current === "filter" ? "active" : ""}
        >
          Filter
        </button>
      </div>

      {filterOpen && <DiscoverFilter handleFilter={handleFilter} />}

      {error ? (
        <div className="error">
          <div className="none">
            <img src={sadtear} alt="Error" />
            <p>
              No internet connection{" "}
              <NavLink onClick={() => window.location.reload()}>
                Refresh
              </NavLink>
            </p>
          </div>
        </div>
      ) : (
        <div className="container">
          {current === "filter" ? renderFilterContent() : renderMainContent()}
        </div>
      )}
    </div>
  );
};
