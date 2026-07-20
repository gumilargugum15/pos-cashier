import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search, Moon, Sun, Wifi, WifiOff, ChevronDown, Menu, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AppSidebar } from "./app-sidebar";
import { CommandPalette } from "./command-palette";
import { useAuth } from "@/hooks/use-auth";
import { useBranches } from "@/hooks/use-branches";

const DARK_MODE_KEY = "nova_pos_dark_mode";
const ACTIVE_BRANCH_KEY = "nova_pos_active_branch";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function TopBar() {
  const [dark, setDark] = useState(false);
  const [online, setOnline] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [activeBranchName, setActiveBranchName] = useState<string | null>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: branches } = useBranches({
    is_active: "1",
    per_page: 100,
    sort: "name",
    direction: "asc",
  });

  async function handleSignOut() {
    await logout();
    navigate({ to: "/login" });
  }

  function selectBranch(name: string) {
    setActiveBranchName(name);
    localStorage.setItem(ACTIVE_BRANCH_KEY, name);
  }

  useEffect(() => {
    const storedDark = localStorage.getItem(DARK_MODE_KEY) === "1";
    setDark(storedDark);
    document.documentElement.classList.toggle("dark", storedDark);
    setActiveBranchName(localStorage.getItem(ACTIVE_BRANCH_KEY));
    setOnline(navigator.onLine);

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    }
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function toggleDark() {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem(DARK_MODE_KEY, next ? "1" : "0");
      return next;
    });
  }

  return (
    <header className="sticky top-0 z-30 glass shadow-soft">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <AppSidebar
              className="flex h-full w-full border-none"
              onNavigate={() => setMobileNavOpen(false)}
            />
          </SheetContent>
        </Sheet>

        <button
          type="button"
          onClick={() => setCommandOpen(true)}
          className="relative flex-1 max-w-xl flex items-center rounded-xl bg-secondary/60 h-10 px-3 text-left text-sm text-muted-foreground hover:bg-secondary/80 transition"
        >
          <Search className="mr-2 size-4" />
          <span className="flex-1">Search products, customers, orders…</span>
          <kbd className="hidden sm:inline-flex items-center rounded-md border bg-background px-1.5 text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </button>

        <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="hidden md:flex h-10 rounded-xl gap-2">
              <span className="size-2 rounded-full bg-primary" />
              {activeBranchName ?? "Semua Cabang"}
              <ChevronDown className="size-4 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl">
            <DropdownMenuLabel>Switch branch</DropdownMenuLabel>
            {branches?.data.length ? (
              branches.data.map((branch) => (
                <DropdownMenuItem key={branch.id} onClick={() => selectBranch(branch.name)}>
                  <span className="flex-1">{branch.name}</span>
                  {activeBranchName === branch.name && <Check className="size-4" />}
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>Belum ada cabang</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="hidden md:flex items-center gap-2 rounded-xl border px-3 h-10 bg-card">
          {online ? (
            <Wifi className="size-4 text-success" />
          ) : (
            <WifiOff className="size-4 text-warning" />
          )}
          <span className="text-xs font-medium">{online ? "Online" : "Offline"}</span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDark}
          aria-label="Toggle theme"
          className="rounded-xl"
        >
          {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-xl pl-1 pr-2 h-10 hover:bg-accent transition">
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                  {user ? getInitials(user.name) : ""}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left leading-tight">
                <div className="text-xs font-semibold">{user?.name}</div>
                <div className="text-[10px] text-muted-foreground">{user?.roles?.[0] ?? ""}</div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link to="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-danger" onClick={handleSignOut}>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
