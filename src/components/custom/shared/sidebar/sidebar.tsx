import Link from "next/link";
import CustomAvatar from "../custom-avatar";
import DottedSeparator from "../dotted-separator";
import Navigation from "./navigation";
import WorkspaceSwitcher from "./workspace-switcher";
import Projects from "./projects";
import ProjectProgress from "./project-progress";

const Sidebar = () => {
  return (
    <aside className="h-full w-full overflow-y-auto bg-neutral-100 p-4 dark:bg-indigo-900/20 dark:backdrop-blur-sm">
      <Link href={"/"} className="flex items-center gap-2">
        <CustomAvatar src="/assets/icons/logo.png" alt="TF" />
        <h1 className="text-xl font-bold sm:text-2xl">
          <span className="text-primary">Task</span> Flow
        </h1>
      </Link>
      <DottedSeparator className="my-4" />
      <WorkspaceSwitcher />
      <DottedSeparator className="my-4" />
      <Navigation />
      <DottedSeparator className="my-4" />
      <Projects />
      <DottedSeparator className="my-4" />
      <ProjectProgress />
    </aside>
  );
};

export default Sidebar;
