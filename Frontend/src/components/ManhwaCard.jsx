export const ManwhaCard = ({name, img_url}) => {
  return (
    <div className="manwha-card">
      <div className="overlay"></div>
      <img src={img_url} alt="" />
      <p className="name">{name}</p>
    </div>
  );
};
