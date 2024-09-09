import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";

// Fetch all documents from a specific collection
export const fetchDataFromCollection = async (collectionName: string) => {
  const collectionRef = collection(db, collectionName);
  const snapshot = await getDocs(collectionRef);
  return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
};

// Delete all documents from a specific collection
export const deleteAllDocumentsFromCollection = async (
  collectionName: string,
) => {
  const collectionRef = collection(db, collectionName);
  const snapshot = await getDocs(collectionRef);

  const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
};

// Fetch a specific document by its ID
export const fetchDocumentById = async (
  collectionName: string,
  documentId: string,
) => {
  const docRef = doc(db, collectionName, documentId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { ...docSnap.data(), id: docSnap.id };
  } else {
    throw new Error("Document not found!");
  }
};

// Add a new document to a collection
export const addDocumentToCollection = async (
  collectionName: string,
  data: any,
) => {
  const collectionRef = collection(db, collectionName);
  const docRef = await addDoc(collectionRef, data);
  return docRef.id;
};

// Update an existing document by ID
export const updateDocumentInCollection = async (
  collectionName: string,
  documentId: string,
  newData: any,
) => {
  const docRef = doc(db, collectionName, documentId);
  await updateDoc(docRef, newData);
};

// Delete a document by ID
export const deleteDocumentFromCollection = async (
  collectionName: string,
  documentId: string,
) => {
  const docRef = doc(db, collectionName, documentId);
  await deleteDoc(docRef);
};

// Delete a room and its related group members
export const deleteRoom = async (roomId: string) => {
  try {
    // Reference to the group members collection
    const groupMembersCollectionRef = collection(db, "groupMembers");

    // Query the group members where roomId equals the provided roomId
    const groupMembersQuery = query(
      groupMembersCollectionRef,
      where("roomId", "==", roomId),
    );

    // Get the group members snapshot
    const groupMembersSnapshot = await getDocs(groupMembersQuery);

    // Deleting all group members where roomId matches
    const deleteGroupMembersPromises = groupMembersSnapshot.docs.map((member) =>
      deleteDoc(doc(db, "groupMembers", member.id)),
    );
    await Promise.all(deleteGroupMembersPromises);

    // Now, delete the room itself
    const roomDocRef = doc(db, "rooms", roomId);
    await deleteDoc(roomDocRef);
  } catch (error) {
    throw new Error("Failed to delete room and its group members.");
  }
};

export const addReaction = async (
  roomId: string,
  messageId: string,
  userId: string,
  reactionType: string,
) => {
  try {
    const messageRef = doc(db, "rooms", roomId, "messages", messageId);

    // Update the message's reactions array
    await updateDoc(messageRef, {
      reactions: arrayUnion({
        reactingUserId: userId,
        reactionType: reactionType,
      }),
    });

    console.log("Reaction added successfully");
  } catch (error) {
    console.error("Error adding reaction: ", error);
  }
};
