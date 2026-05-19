export function OfflinePage() {
  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.reload();
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="text-6xl text-muted-foreground">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-foreground">اتصال اینترنت برقرار نیست</h1>
      <p className="max-w-sm text-muted-foreground">
        لطفاً اتصال اینترنت خود را بررسی کنید و دوباره تلاش کنید.
      </p>
      <button
        onClick={handleRetry}
        className="rounded-lg bg-primary px-6 py-3 text-primary-foreground hover:opacity-90"
      >
        تلاش مجدد
      </button>
    </div>
  );
}
