import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Navigation = () => {
  const { user, signOut } = useAuth();

  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow-sm">
      <Link to="/" className="text-2xl font-bold text-teal-600">
        RaftingPro
      </Link>
      
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link to="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={() => signOut()}
              className="text-red-600 hover:text-red-700"
            >
              Sign Out
            </Button>
          </>
        ) : (
          <>
            <Link to="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button className="bg-teal-600 hover:bg-teal-700">Sign Up</Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navigation; 