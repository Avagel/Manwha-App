import { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { HistoryCard } from "../components/HistoryCard";
import { LoadingCard } from "../components/LoadingCard";
import { LoadingCardHIstory } from "../components/LoadingCardHistory";
import { data } from "react-router";
import { NavLink } from "react-router";
import axios from "axios";
import sadtear from "../assets/sadtear.svg";

export const HistoryPage = ({ historyData, setHistoryData }) => {
  const dummy = [5, 5, 5, 5, 5, 5];
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  console.log(historyData);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (historyData && historyData.length > 0) {
      setLoading(false);
      return;
    }

    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const uuid = localStorage.getItem("manhwaUUID");
    console.log(uuid);

    // example: "550e8400-e29b-41d4-a716-446655440000"

    try {
      const res = await axios.post(`${API_URL}/history/fetch`, {
        UUID: uuid,
      });
      const result = res.data;
      console.log("successful: ", result);
      setHistoryData(result.history);
      setLoading(false);
    } catch (error) {
      setError(error);
    }
  };
  const removeFromHistory = async (link) => {
    const uuid = localStorage.getItem("manhwaUUID");
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        UUID: uuid,
        link,
      }),
    };
    try {
      const res = await axios.post(`${API_URL}/history/remove`, {
        UUID: uuid,
        link,
      });
      const result = res.data;
      console.log("Added", result);

      setHistoryData((prev) => {
        return prev.filter((history) => history.link !== link);
      });
    } catch (error) {
      setError(error);
    }
  };

  return (
    <div className="history-page page">
      <Header setSearch={setSearch} val={"History"} />
      {!loading ? (
        historyData.length > 0 ? (
          <div className="container">
            {historyData
              .sort((a, b) => b.time - a.time)
              .map((data, index) => {
                const { manhwaName } = data;
                if (manhwaName.toLocaleLowerCase().indexOf(search) === -1)
                  return;
                return (
                  <HistoryCard
                    key={index}
                    data={data}
                    removeFromHistory={removeFromHistory}
                  />
                );
              })}
          </div>
        ) : (
          <div className="none">
            <img src={sadtear} alt="" />
            <p>
             Nothing in History
            </p>
          </div>
        )
      ) : (
        <div className="container">
          {dummy.map((item, index) => {
            return <LoadingCardHIstory key={index} />;
          })}
        </div>
      )}
    </div>
  );
};
