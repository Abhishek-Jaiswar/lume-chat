import React from "react";
import { Link } from "react-router-dom";
import logoSvg from "@/assets/lume-log.svg";
import { cn } from "@/lib/utils";

interface ILogo {
  url?: string;
  showText?: boolean;
  imgClass?: string;
  textClass?: string;
}

const Logo = ({
  url = "/",
  showText = true,
  imgClass = "size-[30px]",
  textClass,
}: ILogo) => {
  return (
    <Link to={url} className="flex items-center gap-2 w-fit">
      <img src={logoSvg} alt={imgClass} className="w-10" />
      {showText && (
        <span className={cn("font-semibold text-lg leading-tight", textClass)}>
          Lume
        </span>
      )}
    </Link>
  );
};

export default Logo;
