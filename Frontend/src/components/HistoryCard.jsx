import { faTrash, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router";

export const HistoryCard = ({ data, removeFromHistory }) => {
  const { manhwaName, title, img, time, link } = data;
  const navigate = useNavigate();

  const _time = new Date(time).toLocaleTimeString();

  const handleClick = () => {
    navigate("/series/" + link, { state: { data } });
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    removeFromHistory(link);
  };

  return (
    <div className="history-card" onClick={handleClick}>
      <img src={img} alt="" />
      <div className="text">
        <p>{manhwaName}</p>
        <p>
          {title.replace("Chapter", "Chp.")}- {_time}
        </p>
        {/* <p className="time">{_time}</p> */}
      </div>
      <FontAwesomeIcon icon={faTrashAlt} onClick={handleDelete} />
    </div>
  );
};
