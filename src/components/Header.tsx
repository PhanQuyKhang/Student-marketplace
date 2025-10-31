import { Search, Plus, User, ShoppingBag, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  user: {
    name: string;
    email: string;
    picture?: string;
  } | null;
  onLogin: () => void;
  onLogout: () => void;
}

export function Header({
  currentPage,
  onNavigate,
  searchQuery,
  onSearchChange,
  user,
  onLogin,
  onLogout,
}: HeaderProps) {
  const userInitials = user?.name
    ? user.name
        .split(' ')
        .filter(Boolean)
        .map(part => part[0]?.toUpperCase() ?? '')
        .join('')
        .slice(0, 2)
    : '';
  const firstName = user?.name?.split(' ')[0] ?? '';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => onNavigate('home')}
        >
          <ShoppingBag className="h-6 w-6 text-primary" />
          <span className="font-semibold">UniMarket</span>
        </div>

        {/* Search Bar - Hidden on mobile */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-input-background"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <button
            onClick={() => onNavigate('home')}
            className={`text-sm transition-colors hover:text-primary ${
              currentPage === 'home' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            Browse
          </button>
          <button
            onClick={() => onNavigate('categories')}
            className={`text-sm transition-colors hover:text-primary ${
              currentPage === 'categories' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => onNavigate('sell')}
            className={`text-sm transition-colors hover:text-primary ${
              currentPage === 'sell' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            Sell
          </button>
          <button
            onClick={() => onNavigate('profile')}
            className={`text-sm transition-colors hover:text-primary ${
              currentPage === 'profile' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            My Items
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => onNavigate('sell')}
            className="hidden sm:flex"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Sell Item
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('profile')}
            aria-label="View profile"
          >
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="h-6 w-6 rounded-full object-cover"
              />
            ) : userInitials ? (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium uppercase">
                {userInitials}
              </span>
            ) : (
              <User className="h-4 w-4" />
            )}
          </Button>
          {user ? (
            <>
              {(firstName || user.email) && (
                <span className="hidden sm:inline text-sm text-muted-foreground">
                  {firstName || user.email}
                </span>
              )}
              <Button variant="outline" size="sm" onClick={onLogout}>
                Log out
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={onLogin}>
              Sign in with Google
            </Button>
          )}

          {/* Mobile Menu */}
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-input-background"
          />
        </div>
      </div>
    </header>
  );
}