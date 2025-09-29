import { useEffect, useState } from "react";
import { Header } from "../components/Header";
import { ManwhaCard } from "../components/ManhwaCard";
import { LoadingCard } from "../components/LoadingCard";
import { v4 as uuidv4 } from "uuid";
import none from "../assets/none.svg";

export const LibraryPage = ({ libraryData, setLibraryData,setManhwaData }) => {
  const dummy = [5, 5, 5, 5, 5, 5];
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);

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
      const res = await fetch("http://localhost:3000/user/add", options);
      const result = await res.json();
      console.log("successful: ", result);
      localStorage.setItem("manhwaUUID", uuid);
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
      const res = await fetch("http://localhost:3000/library/fetch", options);
      const result = await res.json();
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
              return <ManwhaCard key={index} data={data} setManhwaData={setManhwaData} />;
            })}
          </div>
        ) : (
          <div className="none">
            <img src={none} alt="" />
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
