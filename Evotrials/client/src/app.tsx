import { useState } from "react";
import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Navigation from "@/components/navigation";
import HomePage from "@/pages/home";
import PatientRegistration from "@/pages/patient-registration";
import AdminDashboard from "@/pages/admin-dashboard";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
    },
  },
});

export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${import.meta.env.VITE_API_URL || "/api"}${endpoint}`;
  const config = {
    headers: { "Content-Type": "application/json" },
    ...options,
  };

  if (config.body && typeof config.body === "object") {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Request failed");
  }
  return response.json();
};

function Router() {
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation isAdmin={isAdmin} onLogout={() => setIsAdmin(false)} />
      
      <Switch>
        <Route path="/" component={() => 
          <HomePage onAdminLogin={() => setIsAdmin(true)} />} 
        />
        <Route path="/register" component={PatientRegistration} />
        <Route path="/admin">
          {isAdmin ? <AdminDashboard /> : <HomePage />}
        </Route>
        <Route component={NotFound} />
      </Switch>
      
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  );
}