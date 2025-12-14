import React from "react";
import { Outlet } from "react-router-dom";

interface Props {
  requiredAuth?: boolean;
}

const RouteGuard = ({ requiredAuth }: Props) => {
  console.log(requiredAuth);

  return (
    <div>
      <Outlet />
    </div>
  );
};

export default RouteGuard;
