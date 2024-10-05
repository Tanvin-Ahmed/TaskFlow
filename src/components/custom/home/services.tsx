import FeatureCard from "./feature-card";

const data = [
  {
    id: crypto.randomUUID(),
    title: "Task Management",
    description:
      "Easily assign tasks to team members, set deadlines, and track progress. Task Flow ensures that every team member knows their responsibilities, helping to keep the project moving efficiently.",
    src: "/assets/img/features/board.png",
  },
  {
    id: crypto.randomUUID(),
    title: "Document create",
    description:
      "Create, edit, and organize project documentation in one place. With Task Flow, all important project details and notes are easily accessible, ensuring smooth collaboration and future reference.",
    src: "/assets/img/features/doc.png",
  },
];

const Services = () => {
  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold text-primary sm:text-3xl md:text-left md:text-4xl lg:text-5xl">
        Services
      </h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {data.map((d) => (
          <FeatureCard
            key={d.id}
            src={d.src}
            title={d.title}
            description={d.description}
          />
        ))}
      </div>
    </div>
  );
};

export default Services;
