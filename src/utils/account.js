export async function logoutToLogin(logout, navigate) {
  await logout()
  navigate('/login', { replace: true })
}
