import { Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { APP_CONFIG } from "~/config/app";
import { useAuthStore } from "~/stores/authStore";

export function meta() {
  return [
    { title: `Login - ${APP_CONFIG.name}` },
    { name: "description", content: "Login to your KwentaMo account" },
  ];
}

export default function LoginPage() {
  const navigate = useNavigate();
  const {
    signIn,
    signInWithGoogle,
    isAuthenticated,
    isLoading: authLoading,
    error: authError,
    clearError,
  } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Show auth errors
  useEffect(() => {
    if (authError) {
      setError(authError);
      clearError();
    }
  }, [authError, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await signIn(formData.email, formData.password);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message || "Invalid email or password");
    }

    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError("");
    const result = await signInWithGoogle();
    if (!result.success) {
      setError(result.message || "Google sign in failed");
    }
    // Redirect handled by Supabase OAuth
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-4">
          <Link to="/" className="inline-flex items-center">
            <img
              src="/logo-text.svg"
              alt="Kwenta MO"
              className="h-10 mx-auto"
            />
          </Link>
        </div>

        <Card className="border-0">
          <CardHeader className="space-y-1 text-center pb-2">
            <CardTitle className="text-2xl font-semibold text-gray-900">
              Welcome back
            </CardTitle>
            <CardDescription className="text-gray-500">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  disabled={isLoading}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-700">
                    Password
                  </Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  disabled={isLoading}
                  className="h-11"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3 pt-2">
              <Button
                type="submit"
                className="w-full h-11"
                variant="green"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

              {/* Google Sign In */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 border-gray-200 hover:bg-gray-50 mb-4"
                onClick={handleGoogleSignIn}
                disabled={isLoading || authLoading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </Button>
              <p className="text-sm text-gray-500 text-center">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-primary font-medium hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
