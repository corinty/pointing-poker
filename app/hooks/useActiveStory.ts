import { useEffect, useState } from "react";
import { Story, storyRepository } from "~/db/story";
import { useCurrentUser } from "./useCurrentUser";

export function useActiveStory(roomId: string, activeStoryId?: string) {
  const [data, setData] = useState<Story | null>(null);
  const currentUser = useCurrentUser();
  useEffect(() => {
    if (!activeStoryId) return;

    const unsub = storyRepository.subscribe(roomId, activeStoryId, {
      next: (snapshot) => {
        if (!snapshot.exists()) return;

        setData(snapshot.data() as Story);
      },
    });

    return () => {
      unsub();
    };
  }, [roomId, activeStoryId]);

  const submitVote = (userId: string, value: number) => {
    if (!activeStoryId) return;
    storyRepository.updateStory(roomId, activeStoryId, {
      [`votes.${userId}`]: value,
    });
  };

  if (!data) return { loading: true, submitVote };

  return {
    loading: false,
    data,
    submitVote,
    currentUserVote: data.votes[currentUser!.uid],
  };
}
