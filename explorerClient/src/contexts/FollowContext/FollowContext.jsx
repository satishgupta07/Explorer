import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useAuth } from "../AuthContext";
import { apiFetch } from "../../utils/apiFetch";
import conf from "../../config/conf";

// Global follow state for the current user. Holds the list of users they
// follow so that SuggestedUsers, UserProfile, UserMiniProfile, ProfilePage,
// and Stories all share a single source of truth — toggling a follow in one
// surface immediately updates every other surface.
export const FollowContext = createContext({
  followingUsers:   [],
  followingIds:     new Set(),
  followingCount:   0,
  isReady:          false,
  isFollowing:      () => false,
  toggleFollow:     async () => {},
  refreshFollowing: async () => {},
});

export const useFollow = () => useContext(FollowContext);

export function FollowProvider({ children }) {
  const { token } = useAuth();

  const [followingUsers, setFollowingUsers] = useState([]);
  const [isReady,        setIsReady]        = useState(false);

  const followingIds = useMemo(
    () => new Set(followingUsers.map((u) => u._id)),
    [followingUsers]
  );

  const fetchFollowing = useCallback(async (signal) => {
    if (!token) {
      setFollowingUsers([]);
      setIsReady(true);
      return;
    }
    try {
      const res  = await apiFetch(`${conf.serverUrl}/users/following`, {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });
      const data = await res.json();
      setFollowingUsers(data.data ?? []);
    } catch (err) {
      if (err.name !== "AbortError") console.error("Fetch following failed:", err);
    } finally {
      setIsReady(true);
    }
  }, [token]);

  // Hydrate on login / clear on logout.
  useEffect(() => {
    if (!token) {
      setFollowingUsers([]);
      setIsReady(false);
      return;
    }
    const ctrl = new AbortController();
    setIsReady(false);
    fetchFollowing(ctrl.signal);
    return () => ctrl.abort();
  }, [token, fetchFollowing]);

  const refreshFollowing = useCallback(() => fetchFollowing(), [fetchFollowing]);

  const isFollowing = useCallback(
    (userId) => followingIds.has(userId),
    [followingIds]
  );

  // `targetUser` should be the full user object (needs at least _id, name, avatar)
  // so we can prepend them to the followingUsers list for Stories.
  const toggleFollow = useCallback(async (targetUser) => {
    if (!token || !targetUser?._id) return;
    const userId       = targetUser._id;
    const wasFollowing = followingIds.has(userId);

    // Optimistic update.
    setFollowingUsers((prev) => {
      if (wasFollowing) return prev.filter((u) => u._id !== userId);
      return prev.some((u) => u._id === userId) ? prev : [...prev, targetUser];
    });

    try {
      const res = await apiFetch(`${conf.serverUrl}/users/follow-user/${userId}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Follow failed (${res.status})`);
    } catch (err) {
      // Roll back.
      setFollowingUsers((prev) => {
        if (wasFollowing) {
          return prev.some((u) => u._id === userId) ? prev : [...prev, targetUser];
        }
        return prev.filter((u) => u._id !== userId);
      });
      console.error("Follow toggle failed:", err);
      throw err;
    }
  }, [token, followingIds]);

  const value = useMemo(
    () => ({
      followingUsers,
      followingIds,
      followingCount: followingUsers.length,
      isReady,
      isFollowing,
      toggleFollow,
      refreshFollowing,
    }),
    [followingUsers, followingIds, isReady, isFollowing, toggleFollow, refreshFollowing]
  );

  return <FollowContext.Provider value={value}>{children}</FollowContext.Provider>;
}
