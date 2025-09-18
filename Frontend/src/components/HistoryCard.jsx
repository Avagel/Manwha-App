import { faTrash, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const HistoryCard = ({name,img_url}) => {
  return (
    <div className="history-card">
      <img src={img_url} alt="" />
      <div className="text">
        <p>{name}</p>
        <p className="time">time</p>
      </div>
      <FontAwesomeIcon icon={faTrashAlt} />
    </div>
  );
};
