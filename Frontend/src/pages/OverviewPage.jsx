import { Header } from "../components/Header";
import { GenreCard } from "../components/GenreCard";
import { ChapterCard } from "../components/ChapterCard";
import { useLocation } from "react-router";
import { useState, useEffect } from "react";
import axios from "axios";

export const OverviewPage = ({ setHistoryData }) => {
  const location = useLocation();
  const { data } = location.state || {};

  const [manhwaData, setManhwaData] = useState({ ...data });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (manhwaData.summary) return;
    fetchOtherData();
  }, []);
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      link: data.link,
    }),
  };
  //fetch data
  const fetchOtherData = async () => {
    try {
      const res = await axios.post("http://localhost:3000/manhwa/details", {
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
      setError(error);
    }
  };
  const { title, img, genres, chapters, summary, link, rating } = manhwaData;
  if (chapters) localStorage.setItem("allChapters", JSON.stringify(chapters));

  return (
    <>
      <Header val={"back"} />
      <div className="overview-page page">
        {manhwaData.genres ? (
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
          <div className="loading">loading</div>
        )}
      </div>
    </>
  );
};
