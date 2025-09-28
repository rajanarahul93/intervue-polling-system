// Socket event interfaces matching your server
export interface ServerToClientEvents {
  poll_state: (data: {
    poll: Poll | null;
    hasVoted: boolean;
    results: PollResult[] | null;
  }) => void;
  new_poll: (poll: Poll) => void;
  poll_update: (data: { totalVotes: number; results: PollResult[] }) => void;
  poll_ended: (data: { poll: Poll; results: PollResult[]; totalVotes: number }) => void;
  vote_confirmed: (data: { optionIndex: number }) => void;
  user_count_update: (data: { teachers: number; students: number }) => void;
  error: (data: { message: string }) => void;
}

export interface ClientToServerEvents {
  join: (data: { name: string; userType: 'teacher' | 'student' }) => void;
  create_poll: (data: { question: string; options: string[]; timeLimit?: number }) => void;
  submit_vote: (data: { optionIndex: number }) => void;
  get_results: () => void;
}

export interface Poll {
  id: number;
  question: string;
  options: { text: string; votes: number }[];
  timeLimit: number;
  createdAt: string;
  isActive: boolean;
}

export interface PollResult {
  text: string;
  votes: number;
  percentage: number;
}

export interface User {
  name: string;
  type: 'teacher' | 'student';
  hasVoted?: boolean;
}