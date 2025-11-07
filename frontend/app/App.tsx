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

export function App() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => {
          logger.debug('Service Worker registered successfully')
        })
        .catch((err) => {
          // Service worker não é crítico, apenas log em dev
          logger.debug('Service Worker registration failed (non-critical):', err)
        })
    }
  }, [])

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <AnnouncementBar />
        <Header />
        <main className="flex-1">
          <Suspense fallback={<div className="py-20 text-center text-sm text-gray-500">A carregar…</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/catalogo" element={<Catalog />} />
              <Route path="/produto/:id" element={<ProductDetail />} />
              <Route path="/carrinho" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/pagamentos" element={<Navigate to="/checkout" replace />} />
              <Route path="/sucesso" element={<CheckoutSuccess />} />
              <Route path="/sobre" element={<About />} />
              <Route path="/contato" element={<Contact />} />
              <Route path="/politica-privacidade" element={<PrivacyPolicy />} />
              <Route path="/termos" element={<Terms />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/envios" element={<Envios />} />
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
              <Route
                path="/admin/legacy"
                element={
                  <ProtectedRoute requireAuth={true}>
                    <Admin />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
