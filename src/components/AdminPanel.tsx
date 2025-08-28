import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Lock, Unlock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface AdminPanelProps {
  isAuthenticated: boolean;
  onAuthenticate: (authenticated: boolean) => void;
}

const ADMIN_PASSWORD = "spin-admin-2024";

export const AdminPanel = ({ isAuthenticated, onAuthenticate }: AdminPanelProps) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      onAuthenticate(true);
      setPassword("");
      toast.success("Admin access granted!");
    } else {
      toast.error("Incorrect password");
    }
  };

  const handleLogout = () => {
    onAuthenticate(false);
    toast.success("Admin session ended");
  };

  if (isAuthenticated) {
    return (
      <Card className="glass-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Unlock className="w-5 h-5 text-green-400" />
            <span className="font-semibold text-green-400">Admin Mode Active</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="hover:scale-105 transition-smooth"
          >
            Logout
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          You can now see and edit probability settings for each item.
        </p>
      </Card>
    );
  }

  return (
    <Card className="glass-card p-4">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Lock className="w-5 h-5 text-muted-foreground" />
          <span className="font-semibold">Admin Access</span>
        </div>
        
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleLogin()}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
          <Button
            onClick={handleLogin}
            disabled={!password}
            className="gradient-primary hover:scale-105 transition-smooth"
          >
            Login
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Access the admin panel to configure probability settings for each wheel item.
        </p>
      </div>
    </Card>
  );
};