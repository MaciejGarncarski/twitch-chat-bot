import z from "zod";

const ytDlpDurationSchema = z.object({
  duration: z.number().nullable(),
  title: z.string(),
});

export const getVideoLengthAndTitle = async (videoUrl: string) => {
  const command = ["yt-dlp", "-J", "--skip-download", videoUrl];

  const process = Bun.spawn(command, {
    stdout: "pipe",
    stderr: "pipe",
  });

  const [outputBytes, errorBytes, exit] = await Promise.all([
    Bun.readableStreamToArrayBuffer(process.stdout),
    Bun.readableStreamToArrayBuffer(process.stderr),
    process.exited,
  ]);

  const output = new TextDecoder().decode(outputBytes).trim();
  const errorOutput = new TextDecoder().decode(errorBytes).trim();

  if (exit !== 0) {
    throw new Error(
      `yt-dlp execution failed (Exit Code ${exit}): ${
        errorOutput || "Unknown error."
      }`
    );
  }

  try {
    const rawMetadata = JSON.parse(output);
    const metadata = ytDlpDurationSchema.parse(rawMetadata);

    if (metadata.duration === null) {
      throw new Error(`Could not find duration for video: ${metadata.title}`);
    }

    return {
      duration: metadata.duration,
      title: metadata.title,
    };
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(
        `Failed to parse yt-dlp output for ${videoUrl}: ${e.message}`
      );
    }
    throw new Error(
      `An unexpected error occurred while processing yt-dlp output.`
    );
  }
};
