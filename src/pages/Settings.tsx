import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft } from "lucide-react";
import { apiService } from "@/services/api";

const Settings = () => {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await apiService.auth.logout();
    } catch (error) {
      console.warn("API logout failed:", error);
    }
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  U
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">User</p>
                <p className="text-xs text-muted-foreground">
                  Profile management coming soon
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
            <CardDescription>Sign out of your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="destructive" 
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
