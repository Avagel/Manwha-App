import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { Header } from "../components/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBackspace,
  faBackward,
  faCaretLeft,
  faForward,
  faL,
} from "@fortawesome/free-solid-svg-icons";
import Loader from "../components/Loader";
import axios from "axios";
import sadtear from "../assets/sadtear.svg";
import { NavLink } from "react-router";

export const ReadingPage = ({ addToHistory }) => {
  const location = useLocation();
  const { data } = location.state;
  console.log(data.manhwaName);
  const allChapters = JSON.parse(
    localStorage.getItem("allChapters" + data.manhwaName)
  );
  const navigate = useNavigate();
  const [images, setImages] = useState(null);
  const [error, setError] = useState(null);
  const [showControls, setShowControls] = useState(false);
  const scrollTimeout = useRef(null);
  const { lin, chapterId } = useParams();
  const _link = lin + "/chapter/" + chapterId;
  const API_URL = import.meta.env.VITE_API_URL;

  // const { link } = data;

  // const _chapter = link.split("/");
  const chapter = chapterId;

  const handleTap = () => {
    // Only toggle if not currently scrolling
    if (!scrollTimeout.current) {
      setShowControls((prev) => !prev);
    }
  };

  useEffect(() => {
    console.log("fetchimg images " + _link);
    data.date = new Date().toLocaleTimeString();
    data.title = "Chapter " + chapterId;

    console.log("adding to history...");
    addToHistory(data);

    const controller = new AbortController();
    setShowControls(true);
    if (!images) {
      fetchImages(_link, controller);
    }

    return () => {
      controller.abort();
    };
  }, [_link]);

  const checkIfExist = (link) => {
    console.log("link to check: ", link);
    const manhwa = allChapters.filter((manhwa) => manhwa.link == link);

    if (manhwa.length > 0) return true;
    return false;
  };

  const fetchImages = async (link, controller) => {
    try {
      const res = await axios.post(`${API_URL}/manhwa/pages`, {
        link: _link,
        signal: controller.signal,
      });
      const result = res.data;
      setImages(result);
    } catch (error) {
      console.log(error);
      setError(error);
    }
  };
  const changeChap = (to) => {
    let newLink = lin + "/chapter/";

    // Increment chapter number
    const nextChapter =
      to == "next" ? Number(chapter) + 1 : Number(chapter) - 1;

    newLink += nextChapter;

    if (!checkIfExist(newLink)) {
      alert("manwha Finished");
      return;
    }

    data.link = newLink;
    navigate("/series/" + newLink, {
      replace: true, // stays on the same URL
      state: { data },
    });
    setImages(null);
  };

  return (
    <div className="reading-page page">
      <div className="controls" hidden={!showControls}>
        <div className="top">
          <button
            onClick={() => {
              setTimeout(() => {
                navigate(-1);
              }, 500);
            }}
          >
            <FontAwesomeIcon icon={faCaretLeft} />
          </button>
          <p className="chap-name">{"Chapter " + chapter}</p>
        </div>
        <div className="bottom">
          <button
            onClick={() => {
              changeChap("prev");
            }}
          >
            <FontAwesomeIcon icon={faBackward} />
          </button>
          <button
            onClick={() => {
              changeChap("next");
            }}
          >
            <FontAwesomeIcon icon={faForward} />
          </button>
        </div>
      </div>

      {error ? (
        (
          <div className="none">
            <img src={sadtear} alt="" />
            <p>
              {error.message || "Unable to Load Manhwa"}
              <NavLink onClick={() => setRefreshKey((old) => old + 1)}>
                Refresh
              </NavLink>
            </p>
          </div>
        ) || String(error)
      ) : images ? (
        images.length == 0 ? (
          setError("Images Not found")
        ) : (
          images.map((img, index) => {
            return <img key={index} src={img} alt="" onClick={handleTap} loading="lazy"/>;
          })
        )
      ) : (
        <>
          {" "}
          <div className="loading"> </div>
          <Loader />
        </>
      )}
    </div>
  );
};
