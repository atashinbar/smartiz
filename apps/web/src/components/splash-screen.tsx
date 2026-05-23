import { Spinner } from "@smartiz/ui";

export function SplashScreen({ isVisible }: { isVisible: boolean }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-300"
      style={{
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? "auto" : "none",
      }}
    >
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-3xl font-bold text-primary">اسمارتیز</h1>
        <Spinner size="lg" className="text-primary" />
      </div>
    </div>
  );
}
