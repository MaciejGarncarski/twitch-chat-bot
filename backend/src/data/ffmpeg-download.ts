import { getYtVideo } from "@/data/get-yt-video";

const downloadAudioWithFfmpeg = async (
  streamUrl: string,
  filename: string
): Promise<void> => {
  const command = [
    "ffmpeg",
    "-i",
    streamUrl,
    "-vn",
    "-c:a",
    "libmp3lame",
    "-q:a",
    "2",
    "-y",
    filename,
  ];

  try {
    const process = Bun.spawn(command, {
      stdout: "inherit",
      stderr: "inherit",
    });

    const exitCode = await process.exited;

    if (exitCode !== 0) {
      throw new Error(
        `ffmpeg failed to download audio. Exit code: ${exitCode}`
      );
    }
  } catch (error) {
    if (error instanceof Error)
      console.error(`\n❌ Download process failed:`, error.message);
  }
};
