import { GenreCard } from "../components/GenreCard";
import  ChapterCard  from "../components/ChapterCard";

export const LoadingCardOver = () => {
    const dummy = [5,5,5,5,5,5];
  return (
    <div className="container loading-over">
      <div className="desc">
        <img src="" alt=" " />
        <div className="group">
          <p className="name"> </p>
          <p className="summary"></p>
        </div>
      </div>

      <div className="genres">
        {dummy.map((gen, index) => {
          return <GenreCard />;
        })}
      </div>
      <p className="chap-count">Chapters</p>
      <div className="chapters">
        {dummy.map((data, index) => {
          return <div className="chapter-card"></div>;
        })}
      </div>
    </div>
  );
};
