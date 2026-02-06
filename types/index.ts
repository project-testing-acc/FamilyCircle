// Core Type Definitions

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  role: 'admin' | 'organizer' | 'member' | 'child';
  relation?: string;
  dateOfBirth?: string;
  joinedAt: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface Family {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  members: User[];
  inviteCode?: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'voice' | 'document';
  mediaUrl?: string;
  timestamp: string;
  isRead: boolean;
  reactions?: Reaction[];
  replyTo?: string;
}

export interface Reaction {
  emoji: string;
  userId: string;
  userName: string;
}

export interface Chat {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  avatar?: string;
  participants: string[];
  participantNames: string[];
  lastMessage?: Message;
  unreadCount: number;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  familyId: string;
  title: string;
  description?: string;
  event_type: 'birthday' | 'wedding' | 'dinner' | 'festival' | 'reunion' | 'other';
  event_date: string;
  time?: string;
  location?: string;
  createdBy: string;
  attendees: EventAttendee[];
  chatId?: string;
  reminderSet: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface EventAttendee {
  userId: string;
  userName: string;
  status: 'going' | 'maybe' | 'not_going';
}

export type RSVPStatus = 'going' | 'maybe' | 'not_going';

export interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  description?: string;
  coverImage?: string;
  createdBy: string;
  participants: string[];
  budget?: number;
  status: 'planning' | 'confirmed' | 'ongoing' | 'completed';
  chatId?: string;
  createdAt: string;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  caption?: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
  eventId?: string;
  tripId?: string;
  likes: string[];
  comments: Comment[];
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  type: 'message' | 'event' | 'birthday' | 'trip' | 'mention' | 'system';
  title: string;
  body: string;
  userId: string;
  isRead: boolean;
  data?: any;
  timestamp: string;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  createdBy: string;
  chatId: string;
  expiresAt?: string;
  isAnonymous: boolean;
  allowMultiple: boolean;
  createdAt: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: string[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignedTo: string[];
  assignedBy: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: string;
  completedAt?: string;
}
