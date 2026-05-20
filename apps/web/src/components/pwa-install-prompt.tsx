import { useEffect, useState } from "react";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!deferredPrompt || dismissed) return null;

  const handleInstall = async () => {
    await deferredPrompt.prompt();
    setDeferredPrompt(null);
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 rounded-lg border border-border bg-background p-4 shadow-lg md:bottom-4 md:left-auto md:right-4 md:w-80">
      <p className="mb-3 text-sm text-foreground">
        اسمارتیز را روی دستگاه خود نصب کنید
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleInstall}
          className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
        >
          نصب اپلیکیشن
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground"
        >
          بعداً
        </button>
      </div>
    </div>
  );
}
