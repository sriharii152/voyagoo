import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import ExplorePage from "./pages/ExplorePage";
import BookingsPage from "./pages/BookingsPage";
import DestinationsPage from "./pages/DestinationsPage";
import PlannerPage from "./pages/PlannerPage";
import BudgetPage from "./pages/BudgetPage";
import EventsPage from "./pages/EventsPage";
import ActivitiesPage from "./pages/ActivitiesPage";
import SafetyPage from "./pages/SafetyPage";
import AuthPage from "./pages/AuthPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import TripDiaryPage from "./pages/TripDiaryPage";
import ConnectMePage from "./pages/ConnectMePage";
import ChatBot from "./components/ChatBot";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/destinations" element={<DestinationsPage />} />
            <Route path="/planner" element={<PlannerPage />} />
            <Route path="/budget" element={<BudgetPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/activities" element={<ActivitiesPage />} />
            <Route path="/safety" element={<SafetyPage />} />
            <Route path="/diary" element={<TripDiaryPage />} />
            <Route path="/connect" element={<ConnectMePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ChatBot />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
