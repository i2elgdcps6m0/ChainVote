import { Link, useLocation } from "react-router-dom";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Shield, Vote, Plus, Info } from "lucide-react";

export const Header = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const navItems = [
    { path: "/", label: "Vote Square", icon: Vote },
    { path: "/create", label: "Create Vote", icon: Plus },
    { path: "/about", label: "About", icon: Info },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <Shield className="w-8 h-8 text-primary transition-all duration-300 group-hover:text-primary-glow" />
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              ChainVote
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-8">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 text-sm font-medium transition-all duration-300 ${
                  isActive(path)
                    ? "text-primary glow-text"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>

          {/* Wallet Connect */}
          <div className="connect-wallet">
            <ConnectButton 
              chainStatus="icon"
              showBalance={false}
            />
          </div>
        </div>
      </div>
    </header>
  );
};
