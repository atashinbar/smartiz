import { NavLink } from "react-router-dom";

const tabs = [
  { to: "/", label: "خانه", icon: "🏠" },
  { to: "/chat", label: "چت", icon: "💬" },
  { to: "/content", label: "محتوا", icon: "📚" },
  { to: "/profile", label: "پروفایل", icon: "👤" },
];

export function BottomTabBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-background md:hidden">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === "/"}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors ${
              isActive
                ? "text-primary"
                : "text-muted-foreground"
            }`
          }
        >
          <span className="text-lg">{tab.icon}</span>
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
