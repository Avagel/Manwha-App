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

function App() {
  const [count, setCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(<LibraryPage />);
  const [state, dispatch] = useReducer(reducer, currentPage);
  const pageContext = createContext();

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<LibraryPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="overview/:manhwaName" element={<OverviewPage />} />
            <Route path="discover" element={<DiscoverPage />} />
            <Route path="series" element={<ReadingPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
