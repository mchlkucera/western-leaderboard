import { useState, useEffect, useRef, useMemo } from 'react';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, appId } from '../lib/firebase';
import { Outlaw } from '../types';

export function useOutlaws() {
  const [user, setUser] = useState<User | null>(null);
  const [outlaws, setOutlaws] = useState<Outlaw[]>([]);
  const [displayedOutlaws, setDisplayedOutlaws] = useState<Outlaw[]>([]);
  const [loading, setLoading] = useState(true);

  const sortTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. Auth Handling
  useEffect(() => {
    if (!auth) return;
    
    const initAuth = async () => {
      try {
        await signInAnonymously(auth!);
      } catch (error) {
        console.error("Auth error:", error);
      }
    };

    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // 2. Data Fetching
  useEffect(() => {
    if (!user || !db) return;

    const q = collection(db, 'artifacts', appId, 'public', 'data', 'leaderboard');

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Outlaw[] = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      } as Outlaw));
      setOutlaws(data);
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // 3. Debounced Sorting Logic
  useEffect(() => {
    if (sortTimeoutRef.current) {
      clearTimeout(sortTimeoutRef.current);
    }

    sortTimeoutRef.current = setTimeout(() => {
      const sortedData = [...outlaws].sort((a, b) => (b.bounty || 0) - (a.bounty || 0));
      setDisplayedOutlaws(sortedData);
    }, 750); 

    return () => {
      if (sortTimeoutRef.current) {
        clearTimeout(sortTimeoutRef.current);
      }
    };
  }, [outlaws]);

  // 4. Calculations for Visuals
  const maxBounty = useMemo(() => {
    return outlaws.length > 0 ? Math.max(...outlaws.map(o => o.bounty || 0)) : 100;
  }, [outlaws]);

  // 5. Actions (Only if user is authenticated/admin, but logic resides here)
  const addPlayer = async (name: string, bounty: number) => {
    if (!user || !db) return;
    try {
      const seed = name + Math.random().toString(36).substring(7);
      const imageUrl = `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}`;

      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'leaderboard'), {
        name,
        bounty,
        image: imageUrl,
        createdAt: serverTimestamp(),
        status: "Wanted"
      });
    } catch (err) {
      console.error("Error adding:", err);
    }
  };

  const updateBounty = async (id: string, currentBounty: number, amount: number) => {
    if (!user || !db) return;
    const newAmount = Math.max(0, currentBounty + amount);
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'leaderboard', id);
    await updateDoc(docRef, { bounty: newAmount });
  };

  const setPlayerBounty = async (id: string, amount: number) => {
    if (!user || !db) return;
    const newAmount = Math.max(0, parseInt(String(amount)));
    if (isNaN(newAmount)) return;
    
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'leaderboard', id);
    await updateDoc(docRef, { bounty: newAmount });
  };

  const removePlayer = async (id: string) => {
    if (!user || !db) return;
    if (window.confirm("Are you sure this outlaw has been caught?")) {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'leaderboard', id);
      await deleteDoc(docRef);
    }
  };

  return {
    user,
    outlaws,
    displayedOutlaws,
    loading,
    maxBounty,
    addPlayer,
    updateBounty,
    setPlayerBounty,
    removePlayer
  };
}

