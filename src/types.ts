export type User = {
  userId: number;
  cognitoId: string;
  username: string;
  profilePictureUrl?: string | null;
  teamId?: number | null;

  authoredTasks: Task[];
  assignedTasks: Task[];
  taskAssignments: TaskAssignment[];
  attachments: Attachment[];
  comments: Comment[];
  team?: Team | null;
};

export type Team = {
  id: number;
  teamName: string;
  productOwnerUserId?: number | null;
  projectManagerUserId?: number | null;
  projectTeams: ProjectTeam[];
  user: User[];
};

export type Project = {
  id: number;
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  tasks?: Task[];
  projectTeams?: ProjectTeam[];
};

export type ProjectTeam = {
  id: number;
  teamId: number;
  projectId: number;
  team: Team;
  project: Project;
};

export type Task = {
  id: number;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  tags?: string;
  startDate?: Date;
  dueDate?: Date;
  points?: number;
  projectId: number;
  authorUserId: number;
  assignedUserId?: number;

  project?: Project;
  author?: User;
  assignee?: User;
  taskAssignments?: TaskAssignment[];
  attachments?: Attachment[];
  comments?: Comment[];
};

export type TaskAssignment = {
  id: number;
  userId: number;
  taskId: number;

  user?: User;
  task?: Task;
};

export type Attachment = {
  id: number;
  fileURL: string;
  fileName?: string;
  taskId: number;
  uploadedById: number;

  task?: Task;
  uploadedBy?: User;
};

export type Comment = {
  id: number;
  text: string;
  taskId: number;
  userId: number;

  task?: Task;
  user?: User;
};


export type loginRequest = {
  email: string;
  password: string;
}

export type passwordRequest = {
  token: string;
}