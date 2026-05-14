import { Button } from "@smartiz/ui";

function App() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Smartiz Admin</h1>
        <p className="text-muted-foreground">Admin Panel</p>
        <div className="space-x-2">
          <Button>Login</Button>
        </div>
      </div>
    </div>
  );
}

export default App;
