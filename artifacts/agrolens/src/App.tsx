import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { ScanProvider } from "@/lib/scan-store";
import { LanguageProvider } from "@/lib/language-context";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import DashboardPage from "@/pages/dashboard";
import ScanPage from "@/pages/scan";
import ScanResultPage from "@/pages/scan-result";
import PremiumRecommendationPage from "@/pages/premium-recommendation";
import HistoryPage from "@/pages/history";
import SubscriptionPage from "@/pages/subscription";
import CheckoutPage from "@/pages/checkout";
import PlaceholderPage from "@/pages/placeholder";
import ProfilePage from "@/pages/profile";
import IrrigationPage from "@/pages/irrigation";
import RecommendationsPage from "@/pages/recommendations";
import AnalyticsPage from "@/pages/analytics";
import ScrollToTop from "@/components/ScrollToTop";
import { MessageSquare } from "lucide-react";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user } = useAuth();
  if (!user) return <Redirect to="/login" />;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        <Redirect to="/login" />
      </Route>
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />

      <Route path="/dashboard">
        <ProtectedRoute component={DashboardPage} />
      </Route>
      <Route path="/scan/result">
        <ProtectedRoute component={ScanResultPage} />
      </Route>
      <Route path="/scan">
        <ProtectedRoute component={ScanPage} />
      </Route>
      <Route path="/recommendations">
        <ProtectedRoute component={RecommendationsPage} />
      </Route>
      <Route path="/premium-recommendation">
        <ProtectedRoute component={PremiumRecommendationPage} />
      </Route>
      <Route path="/irrigation">
        <ProtectedRoute component={IrrigationPage} />
      </Route>
      <Route path="/history">
        <ProtectedRoute component={HistoryPage} />
      </Route>
      <Route path="/subscription">
        <ProtectedRoute component={SubscriptionPage} />
      </Route>
      <Route path="/checkout">
        <ProtectedRoute component={CheckoutPage} />
      </Route>
      <Route path="/chat">
        <ProtectedRoute component={() => (
          <PlaceholderPage
            title="BHOOMI AI Assistant"
            description="Chat with BHOOMI — your intelligent farming companion. Ask questions about crops, weather, market prices, and more."
            icon={MessageSquare}
          />
        )} />
      </Route>
      <Route path="/analytics">
        <ProtectedRoute component={AnalyticsPage} />
      </Route>
      <Route path="/profile">
        <ProtectedRoute component={ProfilePage} />
      </Route>
      <Route>
        <Redirect to="/login" />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <AuthProvider>
            <ScanProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <ScrollToTop />
                <Router />
              </WouterRouter>
              <Toaster />
            </ScanProvider>
          </AuthProvider>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
