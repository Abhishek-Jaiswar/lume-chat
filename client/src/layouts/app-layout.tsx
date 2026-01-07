import { Outlet } from "react-router-dom";
import AppWrapper from "@/components/app-wrapper";

const AppLayout = () => {
  return (
    <AppWrapper>
      <Outlet />
    </AppWrapper>
  );
};

export default AppLayout;
