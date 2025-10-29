export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <p className="text-xl text-text mb-8">Page Not Found</p>
        <a
          href="/"
          className="btn-primary px-6 py-3 rounded-md inline-block"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}


