import { Route, Routes } from "react-router-dom";
import RouteGuard from "./route-guard";
import BaseLayout from "@/layouts/base-layout";
import { authRoutePaths, protectedRoutePaths } from "./routes";
import AppLayout from "@/layouts/app-layout";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<RouteGuard requiredAuth={false} />}>
        <Route element={<BaseLayout />}>
          {authRoutePaths?.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>
      </Route>

      <Route path="/" element={<RouteGuard requiredAuth={false} />}>
        <Route element={<AppLayout />}>
          {protectedRoutePaths?.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
