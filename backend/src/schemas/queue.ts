import z from "zod";

export const songRequestInputSchema = z.object({
  userId: z.string().min(1),
  videoUrl: z.string(),
});

export type QueuedItem = {
  id: string;
  userId: string;
  videoUrl: string;
  duration: number;
  title: string;
  requestedAt: Date;
};

export type PlayableItem = QueuedItem & {
  audioUrl: string;
};

export type QueueTrackedItem = QueuedItem & {
  position: number;
  timeUntilPlay: number;
  formattedTimeUntilPlay: string;
};
