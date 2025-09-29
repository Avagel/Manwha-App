import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { Header } from "../components/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBackward, faL } from "@fortawesome/free-solid-svg-icons";
import Loader from "../components/Loader";

export const ReadingPage = ({ addToHistory }) => {
  const allChapters = JSON.parse(localStorage.getItem("allChapters"));
  const location = useLocation();
  const navigate = useNavigate();
  const { data } = location.state;
  const [images, setImages] = useState(null);
  const [error, setError] = useState(null);
  const [showControls, setShowControls] = useState(false);
  const scrollTimeout = useRef(null);
  const { link } = data;
  console.log(data);
  const _chapter = link.split("/");
  const chapter = _chapter[_chapter.length - 1];

  const handleScroll = () => {
    console.log("scroll");
    // If user is scrolling, don’t show controls
    setShowControls(false);

    // Add a small delay to distinguish between scroll vs tap
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);

    scrollTimeout.current = setTimeout(() => {
      scrollTimeout.current = null; // allow taps again
    }, 200); // 200ms after scroll ends
  };

  // Current state
  console.log("Current state:", location.state);

  const handleTap = () => {
    // Only toggle if not currently scrolling
    if (!scrollTimeout.current) {
      setShowControls((prev) => !prev);
    }
  };

  useEffect(() => {
    console.log("render")
    const controller = new AbortController();
    setShowControls(true);
    addToHistory(data);
    if (!images) {
      fetchImages(link, controller);
    }

    return () => {
      controller.abort();
    };
  }, [link]);


  const checkIfExist = (link) => {
    const manhwa = allChapters.filter((manhwa) => manhwa.link == link);
    console.log(manhwa);
    if (manhwa.length > 0) return true;
    return false;
  };

  const fetchImages = async (link, controller) => {
    console.log("Fetchong: ", link);
    const options = {
      signal: controller.signal,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        link,
      }),
    };
    try {
      const res = await fetch("http://localhost:3000/manhwa/pages", options);
      const result = await res.json();
      setImages(result);
      console.log(result);
    } catch (error) {
      if (error.name === "AbortError") {
        // request was cancelled on purpose -> ignore
        console.log("Fetch aborted");
        return;
      }
      setError(error);
    }
  };
  const changeChap = (to) => {
    let newLink = _chapter.slice(0, -1).join("/") + "/";

    // Increment chapter number
    const nextChapter =
      to == "next" ? Number(chapter) + 1 : Number(chapter) - 1;
    newLink += nextChapter;

    console.log("check", checkIfExist(newLink));
    if (!checkIfExist(newLink)) {
      console.log("manwha finished");
      setError("Manhwa Finished");
      return;
    }

    console.log("New link ", newLink);

    data.link = newLink;
    navigate(location.pathname, {
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
            <FontAwesomeIcon icon={faBackward} />
          </button>
          <p className="chap-name">{"Chapter " + chapter}</p>
        </div>
        <div className="bottom">
          <button
            onClick={() => {
              changeChap("prev");
            }}
          >
            prev
          </button>
          <button
            onClick={() => {
              changeChap("next");
            }}
          >
            next
          </button>
        </div>
      </div>

      {error ? error.message || String(error) : ""}

      {images ? (
        images.map((img, index) => {
          return <img key={index} src={img} alt="" onClick={handleTap} />;
        })
      ) : (
        <>
          {" "}
          <div className="loading">
            {" "}
            <Loader />
          </div>
        </>
      )}
    </div>
  );
};
