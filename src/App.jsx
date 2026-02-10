import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SettingsProvider } from './context/SettingsContext'
import { ToastProvider } from './components/Toast'
import { ErrorBoundary } from './components/ErrorBoundary'
import Layout from './components/Layout'
import { PageLoadingSkeleton } from './components/Skeleton'
import ScrollToTop from './components/ScrollToTop'
import TestMaps from './pages/TestMaps'

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const UpdatePassword = lazy(() => import('./pages/UpdatePassword'))
const PostGig = lazy(() => import('./pages/client/PostGig'))
const ClientDashboard = lazy(() => import('./pages/client/ClientDashboard'))
const GigFeed = lazy(() => import('./pages/worker/GigFeed'))
const GigDetails = lazy(() => import('./pages/worker/GigDetails'))
const Profile = lazy(() => import('./pages/Profile'))
const Messages = lazy(() => import('./pages/Messages'))
const Subscription = lazy(() => import('./pages/Subscription'))
const SubscriptionSuccess = lazy(() => import('./pages/SubscriptionSuccess'))
const PaymentsHistory = lazy(() => import('./pages/PaymentsHistory'))
const SavedGigs = lazy(() => import('./pages/SavedGigs'))
const ContactUs = lazy(() => import('./pages/ContactUs'))
const Terms = lazy(() => import('./pages/Terms'))
const Refunds = lazy(() => import('./pages/Refunds'))
const EmailVerified = lazy(() => import('./pages/EmailVerified'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const Professionals = lazy(() => import('./pages/Professionals'))
const CreateProfessionalProfile = lazy(() => import('./pages/CreateProfessionalProfile'))
const ProfessionalDetails = lazy(() => import('./pages/ProfessionalDetails'))
const About = lazy(() => import('./pages/About'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Marketplace = lazy(() => import('./pages/Marketplace'))
const MarketplaceProduct = lazy(() => import('./pages/MarketplaceProduct'))
const MarketplaceSuccess = lazy(() => import('./pages/MarketplaceSuccess'))
const CreateProduct = lazy(() => import('./pages/professional/CreateProduct'))

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SettingsProvider>
          <ToastProvider>
            <Router>
              <ScrollToTop />
              <Suspense fallback={<PageLoadingSkeleton />}>
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="test-maps" element={<TestMaps />} />
                    <Route path="login" element={<Login />} />
                    <Route path="signup" element={<Signup />} />
                    <Route path="forgot-password" element={<ForgotPassword />} />
                    <Route path="update-password" element={<UpdatePassword />} />
                    <Route path="post-gig" element={<PostGig />} />
                    <Route path="dashboard" element={<ClientDashboard />} />
                    <Route path="gigs" element={<GigFeed />} />
                    <Route path="gigs/:id" element={<GigDetails />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="messages" element={<Messages />} />
                    <Route path="subscription" element={<Subscription />} />
                    <Route path="subscription/success" element={<SubscriptionSuccess />} />
                    <Route path="payments" element={<PaymentsHistory />} />
                    <Route path="saved" element={<SavedGigs />} />
                    <Route path="contact" element={<ContactUs />} />
                    <Route path="terms" element={<Terms />} />
                    <Route path="refunds" element={<Refunds />} />
                    <Route path="about" element={<About />} />
                    <Route path="privacy" element={<Privacy />} />
                    <Route path="marketplace" element={<Marketplace />} />
                    <Route path="marketplace/:id" element={<MarketplaceProduct />} />
                    <Route path="marketplace/success" element={<MarketplaceSuccess />} />
                    <Route path="marketplace/sell" element={<CreateProduct />} />
                    <Route path="admin" element={<AdminDashboard />} />
                    <Route path="email-verified" element={<EmailVerified />} />
                    <Route path="professionals" element={<Professionals />} />
                    <Route path="professionals/create" element={<CreateProfessionalProfile />} />
                    <Route path="professionals/:id" element={<ProfessionalDetails />} />
                    {/* 404 Page */}
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </Suspense>
            </Router>
          </ToastProvider>
        </SettingsProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}



// Simple 404 component
function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-200 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Page Not Found</h2>
        <p className="text-slate-500 mb-6">The page you're looking for doesn't exist.</p>
        <a href="/" className="btn-primary">Go Home</a>
      </div>
    </div>
  )
}

export default App
