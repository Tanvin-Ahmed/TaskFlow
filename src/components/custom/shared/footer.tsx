import Link from "next/link";
import CustomAvatar from "./custom-avatar";
import { Dock, DockIcon } from "@/components/ui/dock";
// import github from "@/assets/icons/social/github.svg";
// import facebook from "@/assets/icons/social/facebook.svg";
// import linkedin from "@/assets/icons/social/linkedin.svg";
// import portfolio from "@/assets/icons/social/portfolio.svg";

const Footer = () => {
  return (
    <footer className="mt-20 flex w-full flex-col items-center justify-center bg-[#f1ecff] p-2 dark:bg-indigo-900/20 dark:backdrop-blur-sm">
      <h2 className="text-xl font-bold text-primary sm:text-2xl">Follow Me</h2>
      <div className="relative -mt-5 mb-3">
        <Dock direction="middle">
          <DockIcon>
            <Link href={"https://github.com/Tanvin-Ahmed"} target="_blank">
              <CustomAvatar
                src={"./assets/icons/social/github.svg"}
                alt="github"
                className="h-6 w-6 bg-white"
              />
            </Link>
          </DockIcon>
          <DockIcon>
            <Link href={"https://www.linkedin.com/in/tanvinbd"} target="_blank">
              <CustomAvatar
                src={"./assets/icons/social/linkedin.svg"}
                alt="linkedin"
                className="h-6 w-6"
              />
            </Link>
          </DockIcon>
          <DockIcon>
            <Link
              href={"https://www.facebook.com/tanvinahmed.touhid"}
              target="_blank"
            >
              <CustomAvatar
                src={"./assets/icons/social/facebook.svg"}
                alt="facebook"
                className="h-6 w-6"
              />
            </Link>
          </DockIcon>
          <DockIcon>
            <Link href={"https://tanvin-ahmed.web.app/"} target="_blank">
              <CustomAvatar
                src={"./assets/icons/social/portfolio.svg"}
                alt="portfolio"
                className="h-6 w-6"
              />
            </Link>
          </DockIcon>
        </Dock>
      </div>
      <small className="text-center">
        &copy; {new Date().getFullYear()} by Task Flow. All rights reserved.
      </small>
      <small className="text-[12px]">
        Developed by{" "}
        <Link
          href={"https://www.linkedin.com/in/tanvinbd"}
          target="_blank"
          className="font-semibold text-primary"
        >
          A. N. M. Tanvin Ahmed
        </Link>
      </small>
    </footer>
  );
};

export default Footer;
