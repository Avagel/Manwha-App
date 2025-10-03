import { useNavigate } from "react-router";

export const ManwhaCard = ({ data }) => {
  
  const { img, title } = data;
  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/overview/" + title, { state: { data } });
  };

  return (
    <div className="manwha-card" onClick={handleClick}>
      <div className="overlay"></div>
      <img src={img} alt="" />
      <p className="name">{title}</p>
    </div>
  );
};
