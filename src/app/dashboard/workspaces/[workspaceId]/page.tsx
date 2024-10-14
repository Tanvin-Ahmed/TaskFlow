interface Props {
  params: {
    workspaceId: string;
  };
}

const WorkspacePage = ({ params }: Props) => {
  const { workspaceId } = params;
  return <div>WorkspacePage</div>;
};

export default WorkspacePage;
