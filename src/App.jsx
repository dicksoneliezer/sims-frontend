import { ToastContainer } from 'react-toastify'
import { useLocation } from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.css'
import { useTheme } from './hooks/useTheme'
import AppRoutes from './routes/AppRoutes'
import { PageBoundary } from './components/common/PageBoundary'
import { useLanguage } from './hooks/useLanguage'

export default function App() {
  useLanguage()
  const { theme } = useTheme()
  const location = useLocation()

  return (
    <>
      <PageBoundary resetKey={location.pathname}><AppRoutes /></PageBoundary>
      <ToastContainer
        position="top-right"
        autoClose={3500}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme={theme}
      />
    </>
  )
}
