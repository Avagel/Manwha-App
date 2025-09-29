import { Header } from "../components/Header";
import { NavLink } from "react-router";
import { ManwhaCard } from "../components/ManhwaCard";
import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import { LoadingCard } from "../components/LoadingCard";
import axios from "axios";

export const DiscoverPage = ({ latest, setLatest, popular, setPopular,setManwhaData }) => {
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const [current, setCurrent] = useState("latest");
  const data = current == "latest" ? latest : popular;
  const dummy = [5,5,5,5,5,5]

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
      const res = await axios.get("http://localhost:3000/manhwa/popular");
      const result = res.data
      setPopular(result);
    } catch (error) {
      setError(error);
    }
  };
  const fetchLatest = async () => {
    try {
      const res = await axios.get("http://localhost:3000/manhwa/latest");
      const result = res.data
      console.log(result);
      setLatest(result);
    } catch (error) {
      setError(error);
    }
  };


  return (
    <div className="discover-page page">
      <Header setSearch={setSearch} val={"Discover"} />

      <div className="discover-nav">
        <button
          className={current == "latest"? "active":""}
          onClick={() => {
            setCurrent("latest");
          }}
        >
          Latest
        </button>
        <button
          className={current == "popular" ? "active":""}
          onClick={() => {
            setCurrent("popular");
          }}
        >
          Popular
        </button>
        <button
          className={current == "popular" ? "active":""}
          onClick={() => {
            setCurrent("popular");
          }}
        >
          Filter
        </button>
      </div>
      {error ? <div className="error">Error</div> : ""}

      <div className="container">
        {data.length > 0
          ? data.map((data, index) => {
            const {title} = data
              
              if (title.toLocaleLowerCase().indexOf(search) === -1) return;
              return <ManwhaCard key={index} data = {data}  />;
            })
          : dummy.map((data, index) => {
              return <LoadingCard key={index} />;
            })}
      </div>
    </div>
  );
};
