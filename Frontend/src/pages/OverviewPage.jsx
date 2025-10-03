import { Header } from "../components/Header";
import { GenreCard } from "../components/GenreCard";
// import { ChapterCard } from "../components/ChapterCard";
import { NavLink, useLocation } from "react-router";
import { useState, useEffect, Suspense } from "react";
import { LoadingCard } from "../components/LoadingCard";
import { LoadingCardOver } from "../components/LoadingCardOver";
import sadtear from "../assets/sadtear.svg";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUpShortWide,
  faArrowUpWideShort,
} from "@fortawesome/free-solid-svg-icons";
import { lazy } from "react";

export const OverviewPage = ({ setHistoryData }) => {
  const location = useLocation();
  const { data } = location.state || {};
  const dummy = [5];
  const API_URL = import.meta.env.VITE_API_URL;

  const [manhwaData, setManhwaData] = useState({ ...data });
  // const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState(null);
  const [isReverse, setIsReverse] = useState(false);
  const [search, setSearch] = useState("");
  const ChapterCard = lazy(() => import("../components/ChapterCard"));

  useEffect(() => {
    if (manhwaData.summary) return;
    fetchOtherData();
  }, []);

  //fetch data
  const fetchOtherData = async () => {
    console.log("fetching other data...");
    try {
      const res = await axios.post(`${API_URL}/manhwa/details`, {
        link: data.link,
      });
      const result = res.data;
      console.log("result: ", result);

      setManhwaData((prev) => {
        return {
          ...prev,
          ...result,
        };
      });
    } catch (error) {
      console.log("error " + error);
      setError(error);
    }
  };
  let { title, img, genres, chapters, summary, manhwaName, link, rating } =
    manhwaData;
  if (chapters)
    localStorage.setItem("allChapters" + title, JSON.stringify(chapters));
  const handleSort = () => {
    chapters = chapters.reverse();
    setIsReverse((prev) => !prev);
  };

  return (
    <>
      <Header val={"back"} setSearch={setSearch} />
      <div className="overview-page page">
        {error ? (
          <div className="none">
            <img src={sadtear} alt="" />
            <p>
              No internet connection{" "}
              <NavLink onClick={() => setRefreshKey((old) => old + 1)}>
                Refresh
              </NavLink>
            </p>
          </div>
        ) : manhwaData.genres ? (
          <div className="container">
            <div className="desc">
              <img src={img} alt="pic" />
              <div className="group">
                <p className="name"> {manhwaName}</p>
                <p className="summary">{summary || "No Summary"}</p>
              </div>
            </div>

            <div className="genres">
              {genres.map((gen, index) => {
                return <GenreCard genre={gen} />;
              })}
            </div>
            <div className="sort">
              <p className="chap-count">{chapters.length} Chapters</p>
              <FontAwesomeIcon
                icon={isReverse ? faArrowUpWideShort : faArrowUpShortWide}
                onClick={handleSort}
              />
            </div>
            <div className="chapters">
              <Suspense fallback={<div>Loading...</div>}>
                {chapters.map((data, index) => {
                  data.img = img;
                  data.manhwaName = title;
                  if (data.title.toLocaleLowerCase().indexOf(search) === -1)
                    return;
                  return (
                    <ChapterCard
                      key={index}
                      data={data}
                      setHistoryData={setHistoryData}
                    />
                  );
                })}
              </Suspense>
            </div>
          </div>
        ) : (
          <LoadingCardOver />
        )}
      </div>
    </>
  );
};
