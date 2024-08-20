// Users Collection
interface User {
  userId: string;
  userName: string;
  userEmail: string;
  userProfilePicUrl?: string;
}

// Rooms Collection
interface Room {
  roomId: string;
  roomTitle: string;
  location?: string;
  additionalDataLink?: string;
  isFavorite?: boolean;
  memberIds: GroupMemberType[];
  meetingUrl?: string;
  isOnline?: boolean;
  maxMembers?: number;
  admin: UserType;
  restrictedUserIds?: string[];
}

// Messages Subcollection within Rooms
interface Message {
  messageId: string;
  messageText: string;
  sentTimestamp: number;
  senderUserId: string;
  roomOfMessageId: string;
  reactions: string[];
}

// Replies Subcollection within Messages
interface Reply {
  replyId: string;
  replyText: string;
  sentTimestamp: number;
  senderUserId: string;
  messageId: string;
  reactions: string[];
}

// Reactions Subcollection within Messages and Replies
interface Reaction {
  reactionId: string;
  reactingUserId: string;
  reactionType: string;
}

// GroupMembers Collection
interface GroupMember {
  groupMemberId: string;
  userId: string;
  groupId: string;
  isAnonymous?: boolean;
  nickname?: string;
  avatar?: string;
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
