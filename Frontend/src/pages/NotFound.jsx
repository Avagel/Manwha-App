import { NavLink } from "react-router";
import sadtear from "../assets/sadtear.svg";

export const NotFound = () => {
  return (
    <div className="page">
      <div className="none">
        <img src={sadtear} alt="" />
        <p>
          404 Page Not Found <br/> go to {<NavLink to={"/"}>discover</NavLink>}
        </p>
      </div>
    </div>
  );
};
