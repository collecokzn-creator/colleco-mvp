import React from "react";
import { Link, useLocation } from "react-router-dom";

const Breadcrumbs = () => {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  return (
    <nav className="text-sm text-gray-400 mb-4">
      <Link to="/" className="text-yellow-400 hover:underline">Home</Link>
      {segments.map((segment, index) => {
        const path = "/" + segments.slice(0, index + 1).join("/");
        return (
          <span key={path}>
            {" / "}
            <Link to={path} className="hover:underline capitalize text-yellow-400">
              {segment}
            </Link>
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
