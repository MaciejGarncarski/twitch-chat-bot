export function BackgroundWakeLock() {
  return (
    <audio
      loop
      autoPlay
      muted={false}
      style={{ display: 'none' }}
      src="data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA=="
    />
  )
}
