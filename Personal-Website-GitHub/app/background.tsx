export default function Background() {
  return (
    <main className="background" aria-label="Animated site background">
      <video
        className="background__video"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      >
        <source src="/background.mp4" type="video/mp4" />
      </video>
    </main>
  );
}
