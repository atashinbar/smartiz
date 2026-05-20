import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "داشبورد", icon: "🏠" },
  { to: "/chat", label: "چت هوشمند", icon: "💬" },
  { to: "/content", label: "محتوا", icon: "📚" },
  { to: "/profile", label: "پروفایل", icon: "👤" },
  { to: "/status", label: "وضعیت سیستم", icon: "📡" },
];

export function Sidebar() {
  return (
    <aside className="hidden w-[260px] shrink-0 flex-col border-l border-border bg-background md:flex">
      <nav className="flex flex-col gap-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`
            }
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
