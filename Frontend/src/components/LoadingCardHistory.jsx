export const LoadingCardHIstory = ({ name, img_url }) => {
  return (
    <div className="loading-history-card">
      <div className="img"></div>
      <div className="text">
        <p>{name}</p>
        <p className="time"></p>
      </div>
      <div className="icon"></div>
    </div>
  );
};
