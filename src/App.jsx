import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useTheme } from './hooks/useTheme'
import AppRoutes from './routes/AppRoutes'

export default function App() {
  const { theme } = useTheme()

  return (
    <>
      <AppRoutes />
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
