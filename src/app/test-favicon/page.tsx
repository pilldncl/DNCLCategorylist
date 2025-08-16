export default function TestFavicon() {
  return (
    <div className="p-8">
      <h1>Favicon Test</h1>
      <p>Check if the favicon is working:</p>
      <img src="/favicon.png" alt="Favicon" className="w-16 h-16 border" />
      <p>If you can see the image above, the favicon file is accessible.</p>
    </div>
  );
}
