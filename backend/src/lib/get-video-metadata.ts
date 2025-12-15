export const getVideoMetadata = async (videoUrl: string) => {
  const command = [
    "yt-dlp",
    "--extractor-args=youtube:player_client=android",
    "--no-playlist",
    "--skip-download",
    "--print",
    "%(title)s\n%(duration)s\n%(thumbnail)s",
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

  if (exit !== 0) {
    throw new Error(new TextDecoder().decode(errorBytes));
  }

  const [title, durationRaw, thumbnailRaw] = new TextDecoder()
    .decode(outputBytes)
    .trim()
    .split("\n");

  const duration = Number(durationRaw);

  if (Number.isNaN(duration)) {
    throw new Error("Invalid duration");
  }

  return {
    title,
    duration,
    thumbnail: thumbnailRaw || null,
  };
};
