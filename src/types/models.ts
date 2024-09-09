import { NominatimSuggestion, reactionType } from "./types";
import { Timestamp } from "firebase/firestore";

// Users Collection
interface User {
  userId: string;
  userName: string;
  userEmail: string;
  userProfilePicUrl?: string;
}

// Rooms Collection
interface Room {
  roomTitle: string;
  roomCategory: string; // Category of the room, e.g., the disease name
  location?: NominatimSuggestion;
  additionalDataLink?: string; // Link to additional data about the disease
  meetingUrl?: string; // URL for the meeting (if online)
  isOnline?: boolean; // Boolean indicating if the room is for online meetings
  maxMembers?: number; // Maximum number of members allowed in the room
  adminId: string; // User ID of the room's administrator
  description?: string; // Description of the room
  restrictedUserIds?: string[]; // List of user IDs who are restricted from the room
  meetingFrequency?: string; // Meeting frequency (e.g., weekly, biweekly, monthly)
  groupRules?: string; // Rules governing the group
}

// Messages Subcollection within Rooms
interface Message {
  message: string;
  timestamp: Timestamp;
  userId: string;
  reactions?: reactionType[];
  userName: string;
  userImage: string;
}

// Replies Subcollection within Messages
interface Reply {
  replyId: string;
  replyText: string;
  sentTimestamp: number;
  senderUserId: string;
  messageId: string;
  reactions: string[]; // List of reaction IDs
}

// Reactions Subcollection within Messages and Replies
interface Reaction {
  reactionId: string;
  reactingUserId: string;
  reactionType: string; // Type of reaction (e.g., like, dislike, etc.)
}

// GroupMembers Collection
interface GroupMember {
  userId: string;
  roomId: string;
  isFavorite?: boolean; // Whether the group is marked as a favorite by the user
  isAnonymous?: boolean; // Whether the user has joined the group anonymously
  nickname?: string; // Nickname the user uses in the group
  avatar?: string; // User's avatar image URL
}

// Type Aliases for References
type UserType = User;
type GroupMemberType = GroupMember;

export type {
  User,
  Room,
  Message,
  Reply,
  Reaction,
  GroupMember,
  UserType,
  GroupMemberType,
};
