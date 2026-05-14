import { Routes, Route } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import AdminDashboard from './AdminDashboard'
import AdminBookings from './AdminBookings'

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="bookings" element={<AdminBookings />} />
      </Route>
    </Routes>
  )
}
