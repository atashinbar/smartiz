import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
      <p className="text-muted-foreground">صفحه مورد نظر یافت نشد</p>
      <Link to="/" className="text-primary hover:underline">
        بازگشت به خانه
      </Link>
    </div>
  );
}
