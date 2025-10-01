import { useState } from "react";
import { useNavigate } from "react-router";

export const ChapterCard = ({ data, setHistoryData }) => {
  const navigate = useNavigate();
  const { title, link, date, img } = data;
  const [error, setError] = useState(null);
  data.time = new Date().getTime();
  const API_URL = import.meta.env.NEXT_PUBLIC_API_URL;

  const handleClick = () => {
    // addToHistory();
    navigate("/series/" + link, { state: { data } });
  };

  const addToHistory = async () => {
    const uuid = localStorage.getItem("manhwaUUID");
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        UUID: uuid,
        data: {...data},
      }),
    };

    try {
      const res = await fetch(`${API_URL}/history/add`, options);
      const result = res.json();
      console.log("Added", result);



      setHistoryData((prev) => {
        const _prev = prev.filter((p)=> p.manwhaName !== data.manhwaName)
        console.log(_prev);
        return [..._prev];
      });

    } catch (error) {
      setError(error);
    }
  };


  return (
    <div className="chapter-card" onClick={handleClick}>
      <p className="chap-name">{title}</p>
      <p className="date">{date}</p>
    </div>
  );
};
