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
  latest,
  setLatest,
  popular,
  setPopular,
  setManwhaData,
  current,
  setCurrent,
  filter,
  setFilter,
}) => {
  
  const [error, setError] = useState(null);

  const [filterOpen, setFilterOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const[search,setSearch] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;

  const data = current == "latest" ? latest : popular;
  const dummy = [5, 5, 5, 5, 5, 5];

  useEffect(() => {
    if (popular.length) return;
    else {
      fetchPopular();
    }
  }, []);
  useEffect(() => {
    if (latest.length) return;
    else {
      fetchLatest();
    }
  }, []);

  const fetchPopular = async () => {
    try {
      const res = await axios.get(`${API_URL}/manhwa/popular`);
      const result = res.data;
      setPopular(result);
    } catch (error) {
      setError(error);
    }
  };
  const fetchLatest = async () => {
    try {
      const res = await axios.get(`${API_URL}/manhwa/latest`);
      const result = res.data;
      console.log(result);
      setLatest(result);
    } catch (error) {
      setError(error);
    }
  };
  const handleFilter = async (selectedFilters) => {
    setCurrent("filter");
    setFilterOpen(false);
    setLoading(true);

    let [genres, type, status, order] = selectedFilters;

    if (genres.length == 0) {
      genres = "0";
    } else {
      genres = genres.join("%2C");
    }

    switch (order) {
      case "Last Updated":
        order = "update";
      case "Rating":
        order = "rating";
      case "Bookmark Count":
        order = "bookmarks";
      case "Name (Z-A)":
        order = "desc";
      case "Name (A-Z)":
        order = "asc";
    }

    try {
      const res = await axios.post(`${API_URL}/manhwa/filter`, {
        genre: genres,
        type,
        status,
        order,
      });
      const result = res.data;
      console.log(result);

      setLoading(false);
      setFilter(result);
    } catch (error) {
      console.log(error);
      setError(error);
    }

    console.log([genres, type, status, order]);
  };
  const handleSearch = async (search) => {
    setLoading(true);
    setCurrent("filter");
    try {
      const res = await axios.post(`${API_URL}/manhwa/search`,{search});
      const result = res.data;
      setFilter(result);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
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
          className={current == "latest" ? "active" : ""}
          onClick={() => {
            setCurrent("latest");
          }}
        >
          Latest
        </button>
        <button
          className={current == "popular" ? "active" : ""}
          onClick={() => {
            setCurrent("popular");
          }}
        >
          Popular
        </button>
        <button
          onClick={() => {
            setFilterOpen((prev) => !prev);
          }}
          className={current == "filter" ? "active" : ""}
        >
          Filter
        </button>
      </div>
      {filterOpen ? <DiscoverFilter handleFilter={handleFilter} /> : ""}

      {error ? (
        <div className="error">
          {" "}
          <div className="none">
            <img src={sadtear} alt="" />
            <p>
              No internet connection{" "}
              <NavLink onClick={() => setRefreshKey((old) => old + 1)}>
                Refresh
              </NavLink>
            </p>
          </div>
        </div>
      ) : (
        <div className="container">
          {current == "filter" ? (
            loading ? (
              <Loader />
            ) : filter.length == 0 ? (
              <div className="none">
                <img src={sadtear} alt="" />
                <p>No Manhwa Found</p>
              </div>
            ) : (
              filter.map((data, index) => {
                const { title } = data;

      
                return <ManwhaCard key={index} data={data} />;
              })
            )
          ) : data.length > 0 ? (
            data.map((data, index) => {
              const { title } = data;

              
              return <ManwhaCard key={index} data={data} />;
            })
          ) : (
            dummy.map((data, index) => {
              return <LoadingCard key={index} />;
            })
          )}
        </div>
      )}
    </div>
  );
};
/*
  genre status typr order
*/
