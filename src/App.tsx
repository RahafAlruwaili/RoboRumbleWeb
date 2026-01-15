import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { RoleProvider } from "@/contexts/RoleContext";
import { WorkshopsProvider } from "@/contexts/WorkshopsContext";
import { AttendanceProvider } from "@/contexts/AttendanceContext";
import MainLayout from "@/components/layout/MainLayout";
import DashboardLayout from "@/components/layout/DashboardLayout";
import RoleGuard from "@/components/guards/RoleGuard";
import AuthGuard from "@/components/guards/AuthGuard";
import HomePage from "./pages/HomePage";

import LeaderboardPage from "./pages/LeaderboardPage";
import TeamDetailsPage from "./pages/TeamDetailsPage";
import WorkshopsPage from "./pages/WorkshopsPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

// Dashboard Pages
import VerifyEmailPage from "./pages/dashboard/VerifyEmailPage";
import CompleteProfilePage from "./pages/dashboard/CompleteProfilePage";
import EditProfilePage from "./pages/dashboard/EditProfilePage";
import TeamHubPage from "./pages/dashboard/TeamHubPage";
import CreateTeamPage from "./pages/dashboard/CreateTeamPage";
import JoinTeamPage from "./pages/dashboard/JoinTeamPage";
import RoleSelectionPage from "./pages/dashboard/RoleSelectionPage";
import TeamDashboardPage from "./pages/dashboard/TeamDashboardPage";
import JoinRequestsPage from "./pages/dashboard/JoinRequestsPage";
import AllTeamsPage from "./pages/dashboard/AllTeamsPage";
import TeamProfilePage from "./pages/dashboard/TeamProfilePage";

// Admin Pages
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminTeamsPage from "./pages/admin/AdminTeamsPage";
import AdminAttendancePage from "./pages/admin/AdminAttendancePage";
import AdminExportsPage from "./pages/admin/AdminExportsPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminWorkshopsPage from "./pages/admin/AdminWorkshopsPage";
import EmailTest from "./pages/admin/EmailTest";

// Judge Pages
import JudgeDashboardPage from "./pages/judge/JudgeDashboardPage";
import JudgeScoringPage from "./pages/judge/JudgeScoringPage";
import JudgeTeamsPage from "./pages/judge/JudgeTeamsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <RoleProvider>
          <WorkshopsProvider>
            <AttendanceProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />

                    <Route path="/leaderboard" element={<MainLayout><LeaderboardPage /></MainLayout>} />
                    <Route path="/leaderboard/team/:teamId" element={<MainLayout><AuthGuard redirectTo="/auth"><TeamDetailsPage /></AuthGuard></MainLayout>} />

                    {/* Protected Routes (Authenticated) */}
                    <Route path="/workshops" element={<DashboardLayout><WorkshopsPage /></DashboardLayout>} />
                    <Route path="/dashboard/leaderboard" element={<DashboardLayout><LeaderboardPage isDashboard /></DashboardLayout>} />
                    <Route path="/dashboard/leaderboard/team/:teamId" element={<DashboardLayout><TeamDetailsPage /></DashboardLayout>} />
                    <Route path="/auth" element={<AuthPage />} />

                    {/* Dashboard Routes (Post-Login) */}
                    <Route path="/verify-email" element={<VerifyEmailPage />} />
                    <Route path="/email-test" element={<EmailTest />} />
                    <Route path="/complete-profile" element={<CompleteProfilePage />} />
                    <Route path="/edit-profile" element={<DashboardLayout><EditProfilePage /></DashboardLayout>} />
                    <Route path="/team-hub" element={<DashboardLayout><TeamHubPage /></DashboardLayout>} />
                    <Route path="/create-team" element={<DashboardLayout><CreateTeamPage /></DashboardLayout>} />
                    <Route path="/join-team" element={<DashboardLayout><JoinTeamPage /></DashboardLayout>} />
                    <Route path="/role-selection" element={<DashboardLayout><RoleSelectionPage /></DashboardLayout>} />
                    <Route path="/team-dashboard" element={<DashboardLayout><TeamDashboardPage /></DashboardLayout>} />
                    <Route path="/team-dashboard/requests" element={<DashboardLayout><JoinRequestsPage /></DashboardLayout>} />
                    <Route path="/all-teams" element={<DashboardLayout><RoleGuard allowedRoles={['user', 'admin']}><AllTeamsPage /></RoleGuard></DashboardLayout>} />
                    <Route path="/team/:id" element={<DashboardLayout><TeamProfilePage /></DashboardLayout>} />

                    {/* Admin Routes - Admin Only */}
                    <Route path="/admin" element={<DashboardLayout><RoleGuard allowedRoles={['admin']}><AdminDashboardPage /></RoleGuard></DashboardLayout>} />
                    <Route path="/admin/teams" element={<DashboardLayout><RoleGuard allowedRoles={['admin']}><AdminTeamsPage /></RoleGuard></DashboardLayout>} />
                    <Route path="/admin/attendance" element={<DashboardLayout><RoleGuard allowedRoles={['admin']}><AdminAttendancePage /></RoleGuard></DashboardLayout>} />
                    <Route path="/admin/exports" element={<DashboardLayout><RoleGuard allowedRoles={['admin']}><AdminExportsPage /></RoleGuard></DashboardLayout>} />
                    <Route path="/admin/settings" element={<DashboardLayout><RoleGuard allowedRoles={['admin']}><AdminSettingsPage /></RoleGuard></DashboardLayout>} />
                    <Route path="/admin/workshops" element={<DashboardLayout><RoleGuard allowedRoles={['admin']}><AdminWorkshopsPage /></RoleGuard></DashboardLayout>} />
                    <Route path="/admin/email-test" element={<DashboardLayout><RoleGuard allowedRoles={['admin']}><EmailTest /></RoleGuard></DashboardLayout>} />

                    {/* Judge Routes - Judge and Admin */}
                    <Route path="/judge" element={<DashboardLayout><RoleGuard allowedRoles={['judge', 'admin']}><JudgeDashboardPage /></RoleGuard></DashboardLayout>} />
                    <Route path="/judge/teams" element={<DashboardLayout><RoleGuard allowedRoles={['judge', 'admin']}><JudgeTeamsPage /></RoleGuard></DashboardLayout>} />
                    <Route path="/judge/scoring" element={<DashboardLayout><RoleGuard allowedRoles={['judge', 'admin']}><JudgeScoringPage /></RoleGuard></DashboardLayout>} />

                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </AttendanceProvider>
          </WorkshopsProvider>
        </RoleProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
