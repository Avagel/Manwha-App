import { useEffect, useState } from "react";
import { Header } from "../components/Header";
import { ManwhaCard } from "../components/ManhwaCard";
import { LoadingCard } from "../components/LoadingCard";
import { v4 as uuidv4 } from "uuid";
import none from "../assets/none.svg";
import sadtear from "../assets/sadtear.svg";
import axios from "axios";
import { NavLink } from "react-router";

export const LibraryPage = ({ libraryData, setLibraryData, setManhwaData }) => {
  const dummy = [5, 5, 5, 5, 5, 5];
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;
  

  useEffect(() => {
    const UUID = localStorage.getItem("manhwaUUID");
    if (UUID) {
      if (libraryData && libraryData.length > 0) return;
      fetchLibrary();
    } else {
      console.log("registering user");
      registerUser();
    }
  }, []);

  const registerUser = async () => {
    const uuid = uuidv4();

    // example: "550e8400-e29b-41d4-a716-446655440000"

    try {
      const res = await axios.post(`${API_URL}/user/add`, {
        UUID: uuid,
      });
      console.log(res.data);
      const result = res.data;
      console.log("successful: ", result);
      localStorage.setItem("manhwaUUID", uuid);
      fetchLibrary();
    } catch (error) {
      setError(error);
    }
  };
  const fetchLibrary = async () => {
    const uuid = localStorage.getItem("manhwaUUID");
    console.log(uuid);

    // example: "550e8400-e29b-41d4-a716-446655440000"

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        UUID: uuid,
      }),
    };

    try {
      const res = await axios.post(`${API_URL}/library/fetch`, {
        UUID: uuid,
      });
      const result = res.data;
      console.log("successful: ", result);

      setLibraryData(result.manhwas);
    } catch (error) {
      setError(error);
    }
  };

  console.log("Library Data:", libraryData);
  return (
    <div className="library-page page">
      <Header setSearch={setSearch} val={"Library"} />
      {libraryData ? (
        libraryData.length > 0 ? (
          <div className="container">
            {libraryData.map((data, index) => {
              const { title, img } = data;
              if (title.toLocaleLowerCase().indexOf(search) === -1) return;
              return (
                <ManwhaCard
                  key={index}
                  data={data}
                  setManhwaData={setManhwaData}
                />
              );
            })}
          </div>
        ) : (
          <div className="none">
            <img src={sadtear} alt="" />
            <p>
              No Manhwa in Library <br/> go to
              {<NavLink to="discover"> Discover</NavLink>}
            </p>
          </div>
        )
      ) : (
        <div className="container">
          {dummy.map((item, index) => {
            return <LoadingCard key={index} />;
          })}
        </div>
      )}
    </div>
  );
};
