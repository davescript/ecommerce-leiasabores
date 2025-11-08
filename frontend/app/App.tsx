import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import { Header } from '@components/Header'
import { Footer } from '@components/Footer'
import { AnnouncementBar } from '@components/AnnouncementBar'
import './styles/globals.css'

const Home = lazy(() => import('./pages/Home').then((m) => ({ default: m.Home })))
const Catalog = lazy(() => import('./pages/Catalog').then((m) => ({ default: m.Catalog })))
const ProductDetail = lazy(() => import('./pages/ProductDetail').then((m) => ({ default: m.ProductDetail })))
const Cart = lazy(() => import('./pages/Cart').then((m) => ({ default: m.Cart })))
const Checkout = lazy(() => import('./pages/CheckoutPaymentIntent').then((m) => ({ default: m.CheckoutPaymentIntent })))
const CheckoutSuccess = lazy(() => import('./pages/CheckoutSuccess').then((m) => ({ default: m.CheckoutSuccess })))
const About = lazy(() => import('./pages/About').then((m) => ({ default: m.About })))
const Contact = lazy(() => import('./pages/Contact').then((m) => ({ default: m.Contact })))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then((m) => ({ default: m.PrivacyPolicy })))
const Terms = lazy(() => import('./pages/Terms').then((m) => ({ default: m.Terms })))
const FAQ = lazy(() => import('./pages/FAQ').then((m) => ({ default: m.FAQ })))
const Envios = lazy(() => import('./pages/Envios').then((m) => ({ default: m.Envios })))
const NotFound = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })))

// Admin
const AdminLogin = lazy(() => import('./pages/admin/Login').then((m) => ({ default: m.AdminLogin })))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard').then((m) => ({ default: m.AdminDashboard })))
const ProductsList = lazy(() => import('./pages/admin/Products/index').then((m) => ({ default: m.ProductsList })))
const OrdersList = lazy(() => import('./pages/admin/Orders/index').then((m) => ({ default: m.OrdersList })))
const CustomersList = lazy(() => import('./pages/admin/Customers/index').then((m) => ({ default: m.CustomersList })))
const CategoriesList = lazy(() => import('./pages/admin/Categories/index').then((m) => ({ default: m.CategoriesList })))
const CouponsList = lazy(() => import('./pages/admin/Coupons/index').then((m) => ({ default: m.CouponsList })))
const AdminUsersList = lazy(() => import('./pages/admin/Users/index').then((m) => ({ default: m.AdminUsersList })))
const Settings = lazy(() => import('./pages/admin/Settings/index').then((m) => ({ default: m.Settings })))
const AdminLayout = lazy(() => import('./components/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })))
const ProtectedAdminRoute = lazy(() => import('./components/admin/ProtectedAdminRoute').then((m) => ({ default: m.ProtectedAdminRoute })))

function LayoutWrapper({ children, showHeaderFooter }: { children: React.ReactNode; showHeaderFooter: boolean }) {
  if (showHeaderFooter) {
    return (
      <div className="flex flex-col min-h-screen">
        <AnnouncementBar />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    )
  }
  return <>{children}</>
}

export function App() {
  useEffect(() => {
    // Service Worker desabilitado
  }, [])

  return (
    <BrowserRouter>
      <Suspense fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-lg font-medium text-gray-700">Carregando...</p>
            <p className="text-sm text-gray-500">Aguarde um momento</p>
          </div>
        </div>
      }>
        <Routes>
          {/* Rotas Públicas */}
          <Route
            path="/"
            element={
              <LayoutWrapper showHeaderFooter={true}>
                <Home />
              </LayoutWrapper>
            }
          />
          <Route
            path="/catalogo"
            element={
              <LayoutWrapper showHeaderFooter={true}>
                <Catalog />
              </LayoutWrapper>
            }
          />
          <Route
            path="/produto/:id"
            element={
              <LayoutWrapper showHeaderFooter={true}>
                <ProductDetail />
              </LayoutWrapper>
            }
          />
          <Route
            path="/carrinho"
            element={
              <LayoutWrapper showHeaderFooter={true}>
                <Cart />
              </LayoutWrapper>
            }
          />
          <Route
            path="/checkout"
            element={
              <LayoutWrapper showHeaderFooter={true}>
                <Checkout />
              </LayoutWrapper>
            }
          />
          <Route path="/pagamentos" element={<Navigate to="/checkout" replace />} />
          <Route
            path="/sucesso"
            element={
              <LayoutWrapper showHeaderFooter={true}>
                <CheckoutSuccess />
              </LayoutWrapper>
            }
          />
          <Route
            path="/sobre"
            element={
              <LayoutWrapper showHeaderFooter={true}>
                <About />
              </LayoutWrapper>
            }
          />
          <Route
            path="/contato"
            element={
              <LayoutWrapper showHeaderFooter={true}>
                <Contact />
              </LayoutWrapper>
            }
          />
          <Route
            path="/politica-privacidade"
            element={
              <LayoutWrapper showHeaderFooter={true}>
                <PrivacyPolicy />
              </LayoutWrapper>
            }
          />
          <Route
            path="/termos"
            element={
              <LayoutWrapper showHeaderFooter={true}>
                <Terms />
              </LayoutWrapper>
            }
          />
          <Route
            path="/faq"
            element={
              <LayoutWrapper showHeaderFooter={true}>
                <FAQ />
              </LayoutWrapper>
            }
          />
          <Route
            path="/envios"
            element={
              <LayoutWrapper showHeaderFooter={true}>
                <Envios />
              </LayoutWrapper>
            }
          />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminLayout />
              </ProtectedAdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<ProductsList />} />
            <Route path="orders" element={<OrdersList />} />
            <Route path="customers" element={<CustomersList />} />
            <Route path="categories" element={<CategoriesList />} />
            <Route path="coupons" element={<CouponsList />} />
            <Route path="users" element={<AdminUsersList />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* 404 */}
          <Route
            path="*"
            element={
              <LayoutWrapper showHeaderFooter={true}>
                <NotFound />
              </LayoutWrapper>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
