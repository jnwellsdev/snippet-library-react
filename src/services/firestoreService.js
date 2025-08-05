import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  serverTimestamp,
  runTransaction,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import { User, Snippet, Vote } from '../models';
import { formatTags } from '../utils/transformers';

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  SNIPPETS: 'snippets',
  VOTES: 'votes',
};

// Create a new document in a collection
export const createDocument = async (collectionName, data) => {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

// Get a document by ID
export const getDocument = async (collectionName, id) => {
  const docRef = doc(db, collectionName, id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

// Update a document
export const updateDocument = async (collectionName, id, data) => {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

// Delete a document
export const deleteDocument = async (collectionName, id) => {
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
};

// Get collection with query options
export const getCollection = async (collectionName, options = {}) => {
  const {
    whereConditions = [],
    orderByField = null,
    orderDirection = 'asc',
    limitCount = null,
    startAfterDoc = null,
  } = options;

  let q = collection(db, collectionName);

  // Apply where conditions
  whereConditions.forEach(condition => {
    q = query(q, where(condition.field, condition.operator, condition.value));
  });

  // Apply ordering
  if (orderByField) {
    q = query(q, orderBy(orderByField, orderDirection));
  }

  // Apply pagination
  if (startAfterDoc) {
    q = query(q, startAfter(startAfterDoc));
  }

  // Apply limit
  if (limitCount) {
    q = query(q, limit(limitCount));
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// Create or update user document
export const createOrUpdateUser = async (user) => {
  const validation = user.validate();
  if (!validation.isValid) {
    throw new Error(`Invalid user data: ${validation.errors.join(', ')}`);
  }

  try {
    const userRef = doc(db, COLLECTIONS.USERS, user.id);
    const userData = user.toFirestore();
    
    await updateDoc(userRef, {
      ...userData,
      lastLoginAt: serverTimestamp(),
    });
    
    return user.id;
  } catch (error) {
    // If document doesn't exist, create it
    if (error.code === 'not-found') {
      const userData = user.toFirestore();
      userData.createdAt = serverTimestamp();
      userData.lastLoginAt = serverTimestamp();
      
      const userRef = doc(db, COLLECTIONS.USERS, user.id);
      await setDoc(userRef, userData);
      return user.id;
    }
    throw error;
  }
};

// Get user by ID
export const getUser = async (userId) => {
  const userData = await getDocument(COLLECTIONS.USERS, userId);
  if (!userData) return null;
  
  return User.fromFirestore(userData.id, userData);
};

// Create a new snippet
export const createSnippet = async (snippet) => {
  const validation = snippet.validate();
  if (!validation.isValid) {
    throw new Error(`Invalid snippet data: ${validation.errors.join(', ')}`);
  }

  const snippetData = snippet.toFirestore();
  
  // Format tags to title case before saving
  if (snippetData.tags) {
    snippetData.tags = formatTags(snippetData.tags);
  }
  
  return await createDocument(COLLECTIONS.SNIPPETS, snippetData);
};

// Get snippet by ID
export const getSnippet = async (snippetId) => {
  const snippetData = await getDocument(COLLECTIONS.SNIPPETS, snippetId);
  if (!snippetData) return null;
  
  return Snippet.fromFirestore(snippetData.id, snippetData);
};

// Update snippet
export const updateSnippet = async (snippetId, updates) => {
  // Format tags to title case before saving if tags are being updated
  if (updates.tags) {
    updates = {
      ...updates,
      tags: formatTags(updates.tags)
    };
  }
  
  await updateDocument(COLLECTIONS.SNIPPETS, snippetId, updates);
};

// Toggle snippet approval status
export const toggleSnippetApproval = async (snippetId, approved) => {
  await updateDocument(COLLECTIONS.SNIPPETS, snippetId, { 
    approved: approved
  });
};

// Delete snippet
export const deleteSnippet = async (snippetId) => {
  await deleteDocument(COLLECTIONS.SNIPPETS, snippetId);
};

// Get snippets with pagination and filtering
export const getSnippets = async (options = {}) => {
  const snippetsData = await getCollection(COLLECTIONS.SNIPPETS, options);
  return snippetsData.map(data => Snippet.fromFirestore(data.id, data));
};

// Get top-voted snippets
export const getTopSnippets = async (limitCount = 10) => {
  const options = {
    orderByField: 'voteCount',
    orderDirection: 'desc',
    limitCount,
  };
  
  return await getSnippets(options);
};

// Get snippets by author
export const getSnippetsByAuthor = async (authorId, options = {}) => {
  const queryOptions = {
    ...options,
    whereConditions: [
      { field: 'authorId', operator: '==', value: authorId },
      ...(options.whereConditions || []),
    ],
  };
  
  return await getSnippets(queryOptions);
};

// Get all unique tags from snippets
export const getAllTags = async () => {
  const snippets = await getSnippets();
  const allTags = snippets.reduce((tags, snippet) => {
    if (snippet.tags && Array.isArray(snippet.tags)) {
      snippet.tags.forEach(tag => {
        if (tag) {
          // Format to title case and ensure uniqueness
          const formattedTag = formatTags([tag])[0];
          if (formattedTag && !tags.includes(formattedTag)) {
            tags.push(formattedTag);
          }
        }
      });
    }
    return tags;
  }, []);
  
  return allTags.sort();
};

// Create or toggle a vote
export const toggleVote = async (vote) => {
  const validation = vote.validate();
  if (!validation.isValid) {
    throw new Error(`Invalid vote data: ${validation.errors.join(', ')}`);
  }

  return await runTransaction(db, async (transaction) => {
    const voteId = vote.getCompositeId();
    const voteRef = doc(db, COLLECTIONS.VOTES, voteId);
    const snippetRef = doc(db, COLLECTIONS.SNIPPETS, vote.snippetId);
    
    const voteDoc = await transaction.get(voteRef);
    const snippetDoc = await transaction.get(snippetRef);
    
    if (!snippetDoc.exists()) {
      throw new Error('Snippet not found');
    }
    
    const currentVoteCount = snippetDoc.data().voteCount || 0;
    
    if (voteDoc.exists()) {
      // Remove existing vote
      transaction.delete(voteRef);
      transaction.update(snippetRef, {
        voteCount: currentVoteCount - 1,
        updatedAt: serverTimestamp(),
      });
      
      return { action: 'removed', voteId };
    } else {
      // Add new vote
      transaction.set(voteRef, {
        ...vote.toFirestore(),
        createdAt: serverTimestamp(),
      });
      transaction.update(snippetRef, {
        voteCount: currentVoteCount + 1,
        updatedAt: serverTimestamp(),
      });
      
      return { action: 'added', voteId };
    }
  });
};

// Get user's vote for a snippet
export const getUserVote = async (userId, snippetId) => {
  const voteId = `${userId}_${snippetId}`;
  const voteData = await getDocument(COLLECTIONS.VOTES, voteId);
  
  if (!voteData) return null;
  
  return Vote.fromFirestore(voteData.id, voteData);
};

// Get votes for a snippet
export const getSnippetVotes = async (snippetId) => {
  const options = {
    whereConditions: [
      { field: 'snippetId', operator: '==', value: snippetId },
    ],
  };
  
  const votesData = await getCollection(COLLECTIONS.VOTES, options);
  return votesData.map(data => Vote.fromFirestore(data.id, data));
};

// Listen to snippet changes
export const listenToSnippet = (snippetId, callback) => {
  const snippetRef = doc(db, COLLECTIONS.SNIPPETS, snippetId);
  
  return onSnapshot(snippetRef, (doc) => {
    if (doc.exists()) {
      const snippet = Snippet.fromFirestore(doc.id, doc.data());
      callback(snippet);
    } else {
      callback(null);
    }
  });
};

// Listen to snippets collection changes
export const listenToSnippets = (options = {}, callback) => {
  const {
    whereConditions = [],
    orderByField = 'createdAt',
    orderDirection = 'desc',
    limitCount = 20,
  } = options;

  let q = collection(db, COLLECTIONS.SNIPPETS);

  // Apply where conditions
  whereConditions.forEach(condition => {
    q = query(q, where(condition.field, condition.operator, condition.value));
  });

  // Apply ordering
  if (orderByField) {
    q = query(q, orderBy(orderByField, orderDirection));
  }

  // Apply limit
  if (limitCount) {
    q = query(q, limit(limitCount));
  }

  return onSnapshot(q, (querySnapshot) => {
    const snippets = querySnapshot.docs.map(doc => 
      Snippet.fromFirestore(doc.id, doc.data())
    );
    callback(snippets);
  });
};