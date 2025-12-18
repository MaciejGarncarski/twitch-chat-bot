export const getVideoMetadata = async (videoUrl: string) => {
  const command = [
    "yt-dlp",
    "--ignore-config",
    "--no-warnings",
    "--no-playlist",
    "--flat-playlist",
    "--skip-download",
    "--print-json",
    "--extractor-args",
    "youtube:player_client=android",
    videoUrl,
  ];

  const process = Bun.spawn(command, {
    stdout: "pipe",
    stderr: "pipe",
  });

  const stdout = await new Response(process.stdout).text();
  const exitCode = await process.exited;

  if (exitCode !== 0) {
    const error = await new Response(process.stderr).text();
    throw new Error(`yt-dlp failed: ${error}`);
  }

  try {
    const data = JSON.parse(stdout);
    return {
      title: data.title,
      duration: Number(data.duration),
      thumbnail: data.thumbnail || data.thumbnails?.[0]?.url || null,
    };
  } catch (e) {
    throw new Error("Failed to parse yt-dlp output");
  }
};
