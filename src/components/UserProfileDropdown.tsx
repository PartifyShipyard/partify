import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, LogOut, User } from "lucide-react";
import { apiService } from "@/services/api";
import type { User as UserType } from "@/services/api";

interface UserProfileDropdownProps {
  showName?: boolean;
}

export const UserProfileDropdown = ({ showName = false }: UserProfileDropdownProps) => {
  const navigate = useNavigate();
  const [avatarUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("User");
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    // Load user data from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user: UserType = JSON.parse(userStr);
        setUserName(user.fullName || user.email.split('@')[0] || 'User');
        setUserEmail(user.email);
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }
  }, []);

  const handleLogout = async () => {
    // Logout from API (clears token)
    try {
      await apiService.auth.logout();
    } catch (error) {
      console.warn("API logout failed:", error);
    }
    
    // Clear local tokens and user data
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    
    // Navigate to auth page
    navigate("/auth");
  };

  const getInitials = () => {
    return userName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className={`relative ${showName ? 'w-full justify-start gap-3 px-2 py-2 h-auto' : 'h-10 w-10 rounded-full'}`}
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl || undefined} alt={userName} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          {showName && (
            <div className="flex flex-col items-start flex-1 min-w-0">
              <span className="text-sm font-medium truncate">{userName}</span>
              <span className="text-xs text-muted-foreground">View profile</span>
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-card z-50" align="end" forceMount>
        <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
