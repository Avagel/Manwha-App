import { Header } from "../components/Header";
import { GenreCard } from "../components/GenreCard";
import { ChapterCard } from "../components/ChapterCard";
import { NavLink, useLocation } from "react-router";
import { useState, useEffect } from "react";
import { LoadingCard } from "../components/LoadingCard";
import { LoadingCardOver } from "../components/LoadingCardOver";
import sadtear from "../assets/sadtear.svg";
import axios from "axios";

export const OverviewPage = ({ setHistoryData }) => {
  const location = useLocation();
  const { data } = location.state || {};
  const dummy = [5];
  const API_URL = import.meta.env.VITE_API_URL;

  const [manhwaData, setManhwaData] = useState({ ...data });
  // const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (manhwaData.summary) return;
    fetchOtherData();
  }, []);

  //fetch data
  const fetchOtherData = async () => {
    try {
      const res = await axios.post(`${API_URL}/manhwa/details`, {
        link: data.link,
      });
      const result = res.data;

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
  const { title, img, genres, chapters, summary, link, rating } = manhwaData;
  console.log(link);
  if (chapters)
    localStorage.setItem("allChapters" + title, JSON.stringify(chapters));

  return (
    <>
      <Header val={"back"} />
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
                <p className="name"> {title}</p>
                <p className="summary">{summary}</p>
              </div>
            </div>

            <div className="genres">
              {genres.map((gen, index) => {
                return <GenreCard genre={gen} />;
              })}
            </div>
            <p className="chap-count">{chapters.length} Chapters</p>
            <div className="chapters">
              {chapters.map((data, index) => {
                data.img = img;
                data.manhwaName = title;
                return (
                  <ChapterCard
                    key={index}
                    data={data}
                    setHistoryData={setHistoryData}
                  />
                );
              })}
            </div>
          </div>
        ) : (
          <LoadingCardOver />
        )}
      </div>
    </>
  );
};
