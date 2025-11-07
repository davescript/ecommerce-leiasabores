import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import { Header } from '@components/Header'
import { Footer } from '@components/Footer'
import { AnnouncementBar } from '@components/AnnouncementBar'
import { ProtectedRoute } from '@components/ProtectedRoute'
import { logger } from '@lib/logger'
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
const Admin = lazy(() => import('./pages/Admin').then((m) => ({ default: m.Admin })))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard').then((m) => ({ default: m.Dashboard })))
const AdminLayout = lazy(() => import('./components/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })))
const AdminProducts = lazy(() => import('./pages/admin/Products/index').then((m) => ({ default: m.ProductsList })))
const AdminOrders = lazy(() => import('./pages/admin/Orders/index').then((m) => ({ default: m.OrdersList })))
const AdminCategories = lazy(() => import('./pages/admin/Categories/index').then((m) => ({ default: m.CategoriesList })))
const AdminCoupons = lazy(() => import('./pages/admin/Coupons/index').then((m) => ({ default: m.CouponsList })))
const AdminCustomers = lazy(() => import('./pages/admin/Customers/index').then((m) => ({ default: m.CustomersList })))
const AdminSettings = lazy(() => import('./pages/admin/Settings/index').then((m) => ({ default: m.Settings })))

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
    // Forçar limpeza de cache ao carregar (apenas em /admin)
    if (window.location.pathname.startsWith('/admin')) {
      // Desregistrar service workers antigos
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(registration => {
            // Se o cache name não for v2.0, desregistrar
            registration.unregister().catch(() => {})
          })
        })
        
        // Limpar caches antigos
        caches.keys().then(cacheNames => {
          cacheNames.forEach(cacheName => {
            if (!cacheName.includes('v2.0')) {
              caches.delete(cacheName).catch(() => {})
            }
          })
        })
      }
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { updateViaCache: 'none' })
        .then((registration) => {
          logger.debug('Service Worker registered successfully')
          // Forçar atualização do service worker
          registration.update()
          // Notificar service worker para pular espera
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' })
          }
        })
        .catch((err) => {
          logger.debug('Service Worker registration failed (non-critical):', err)
        })
    }
  }, [])

  return (
    <BrowserRouter>
      <Suspense fallback={<div className="py-20 text-center text-sm text-gray-500">A carregar…</div>}>
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

          {/* Rotas Admin - SEM Header/Footer */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAuth={true}>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute requireAuth={true}>
                <AdminLayout>
                  <AdminProducts />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute requireAuth={true}>
                <AdminLayout>
                  <AdminOrders />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute requireAuth={true}>
                <AdminLayout>
                  <AdminCategories />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/coupons"
            element={
              <ProtectedRoute requireAuth={true}>
                <AdminLayout>
                  <AdminCoupons />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/customers"
            element={
              <ProtectedRoute requireAuth={true}>
                <AdminLayout>
                  <AdminCustomers />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute requireAuth={true}>
                <AdminLayout>
                  <AdminSettings />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Admin Legacy - COM Header/Footer */}
          <Route
            path="/admin/legacy"
            element={
              <LayoutWrapper showHeaderFooter={true}>
                <ProtectedRoute requireAuth={true}>
                  <Admin />
                </ProtectedRoute>
              </LayoutWrapper>
            }
          />

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
