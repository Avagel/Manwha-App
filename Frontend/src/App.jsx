import { act, createContext, useReducer, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import { BrowserRouter, Route, Routes } from "react-router";
import { Layout } from "./pages/Layout";
import { DiscoverPage } from "./pages/DiscoverPage";

import "./App.css";
import { LibraryPage } from "./pages/LibraryPage";
import { OverviewPage } from "./pages/OverviewPage";
import { ReadingPage } from "./pages/ReadingPage";
import { HistoryPage } from "./pages/HistoryPage";
import { reducer } from "./Reducer";
import axios from "axios";

function App() {
  const [currentPage, setCurrentPage] = useState(<LibraryPage />);
  const [latest, setLatest] = useState([]);
  const [popular, setPopular] = useState([]);
  const [libraryData, setLibraryData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [current, setCurrent] = useState("latest");
  const [filter, setFilter] = useState([]);
  const API_URL = import.meta.env.NEXT_PUBLIC_API_URL;

  const addToHistory = async (data) => {
    const uuid = localStorage.getItem("manhwaUUID");
    console.log("Data adding to history: ", data);

    try {
      const res = await axios.post(`${API_URL}/history/add`, {
        UUID: uuid,
        data: { ...data },
      });
      const result = res.data;
      console.log("Added", result);

      const check = historyData.filter(
        (manhw) => manhw.manhwaName == data.manhwaName
      );

      if (check.length > 0) {
        setHistoryData((prev) => {
          return prev.filter((manhw) => manhw.manhwaName !== data.manhwaName);
        });
      }

      console.log("check ", check);

      setHistoryData((prev) => {
        return [...prev, data];
      });
      
    } catch (error) {
      // setError(error);
      console.error(error);
    }
  };

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Layout
                libraryData={libraryData}
                setLibraryData={setLibraryData}
              />
            }
          >
            <Route
              index
              element={
                <LibraryPage
                  libraryData={libraryData}
                  setLibraryData={setLibraryData}
                />
              }
            />
            <Route
              path="history"
              element={
                <HistoryPage
                  historyData={historyData}
                  setHistoryData={setHistoryData}
                />
              }
            />
            <Route
              path="overview/:manhwaName"
              element={<OverviewPage setHistoryData={setHistoryData} />}
            />
            <Route
              path="discover"
              element={
                <DiscoverPage
                  latest={latest}
                  setLatest={setLatest}
                  popular={popular}
                  setPopular={setPopular}
                  current={current}
                  setCurrent={setCurrent}
                  filter={filter}
                  setFilter={setFilter}
                />
              }
            />
            <Route
              path="series/:lin/chapter/:chapterId"
              element={<ReadingPage addToHistory={addToHistory} />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
