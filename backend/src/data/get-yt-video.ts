export const getYtVideo = async (videoUrl: string): Promise<string> => {
  const command = [
    "yt-dlp",
    "--quiet",
    "--no-warnings",
    "--no-playlist",
    "-f",
    "bestaudio",
    "-g",
    videoUrl,
  ];

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
    if (
      errorOutput.includes("Video unavailable") ||
      errorOutput.includes("Private video")
    ) {
      throw new Error(`Video unavailable or private: ${videoUrl}`);
    }

    throw new Error(`yt-dlp execution error: ${errorOutput || exit}`);
  }

  if (!output) {
    throw new Error("yt-dlp returned an empty audio URL.");
  }

  return output;
};
