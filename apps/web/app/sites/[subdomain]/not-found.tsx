export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Portfolio site not found
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          This portfolio site does not exist or is not published.
        </p>
      </div>
    </div>
  );
}
