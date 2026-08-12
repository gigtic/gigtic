import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl mr-6">
          <span>UniGig</span>
        </Link>
        <div className="flex flex-1 items-center space-x-4 text-sm font-medium">
          <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground/60">
            Home
          </Link>
          <Link href="/explore" className="transition-colors hover:text-foreground/80 text-foreground/60">
            Explore
          </Link>
          <Link href="/create" className="transition-colors hover:text-foreground/80 text-foreground/60">
            Create
          </Link>
          <Link href="/chat" className="transition-colors hover:text-foreground/80 text-foreground/60">
            Chat
          </Link>
          <Link href="/profile" className="transition-colors hover:text-foreground/80 text-foreground/60">
            Profile
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign up</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
