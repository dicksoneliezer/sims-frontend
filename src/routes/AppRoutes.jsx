import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Dashboard from '../pages/Dashboard'
import Students from '../pages/Students'
import Subjects from '../pages/Subjects'
import Teachers from '../pages/Teachers'
import Timetables from '../pages/Timetables'
import Login from '../pages/auth/Login'
import NotFound from '../pages/NotFound'
import Parents from '../pages/admin/Parents'
import Accountants from '../pages/admin/Accountants'
import FeeStructure from '../pages/admin/FeeStructure'
import Users from '../pages/admin/Users'
import Finance from '../pages/admin/Finance'
import Inventory from '../pages/admin/Inventory'
import AdminReports from '../pages/admin/Reports'
import Settings from '../pages/admin/Settings'

// Accountant Pages
import AccountantDashboard from '../pages/accountant/Dashboard'
import AccountantStudents from '../pages/accountant/Students'
import AccountantPayments from '../pages/accountant/Payments'
import Invoices from '../pages/accountant/Invoices'
import Expenses from '../pages/accountant/Expenses'
import Debts from '../pages/accountant/Debts'
import Transactions from '../pages/accountant/Transactions'
import Reports from '../pages/accountant/Reports'
import ControlNumbers from '../pages/accountant/ControlNumbers'
import AccountantReconciliation from '../pages/accountant/Reconciliation'  // <-- MPYA
import AccountantProfile from '../pages/accountant/Profile'                // <-- MPYA
import { AccountantLayout } from '../components/layouts/AccountantLayout'

// Student Pages
import StudentDashboard from '../pages/student/Dashboard'
import StudentResults from '../pages/student/Results'
import StudentAttendance from '../pages/student/Attendance'
import StudentNotes from '../pages/student/Notes'
import StudentTimetable from '../pages/student/Timetable'
import StudentProfile from '../pages/student/Profile'
import StudentAssignments from '../pages/student/Assignments'
import StudentReportCard from '../pages/student/ReportCard'
import StudentCertificates from '../pages/student/Certificates'
import StudentAnnouncements from '../pages/student/Announcements'
import { StudentLayout } from '../components/layouts/StudentLayout'

// Teacher Pages
import TeacherDashboard from '../pages/teacher/Dashboard'
import TeacherAttendance from '../pages/teacher/Attendance'
import TeacherMarks from '../pages/teacher/Marks'
import TeacherNotes from '../pages/teacher/Notes'
import TeacherBehavior from '../pages/teacher/Behavior'
import TeacherStudents from '../pages/teacher/Students'
import TeacherSubjects from '../pages/teacher/Subjects'
import TeacherTimetable from '../pages/teacher/Timetable'
import TeacherMessages from '../pages/teacher/Messages'
import TeacherProfile from '../pages/teacher/Profile'
import { TeacherLayout } from '../components/layouts/TeacherLayout'

// Parent Pages
import ParentDashboard from '../pages/parent/Dashboard'
import Children from '../pages/parent/Children'
import ChildDetail from '../pages/parent/ChildDetail'
import Payments from '../pages/parent/Payments'
import History from '../pages/parent/History'
import Balance from '../pages/parent/Balance'
import ParentStatement from '../pages/parent/Statement'
import ParentAnnouncements from '../pages/parent/Announcements'
import ParentMessages from '../pages/parent/Messages'
import ParentGallery from '../pages/parent/Gallery'
import ParentDocuments from '../pages/parent/Documents'
import ParentReportCard from '../pages/parent/ReportCard'
import ParentProfile from '../pages/parent/Profile'
import { ParentLayout } from '../components/layouts/ParentLayout'

// Academic Pages (MPYA)
import AcademicDashboard from '../pages/academic/Dashboard'
import AcademicExams from '../pages/academic/Exams'
import AcademicResults from '../pages/academic/Results'
import AcademicSyllabus from '../pages/academic/Syllabus'
import AcademicTeachers from '../pages/academic/Teachers'
import AcademicStudents from '../pages/academic/Students'
import AcademicTimetable from '../pages/academic/Timetable'
import AcademicAnnouncements from '../pages/academic/Announcements'
import AcademicProfile from '../pages/academic/Profile'
import AcademicAllocation from '../pages/academic/Allocation' // <-- MPYA
import { AcademicLayout } from '../components/layouts/AcademicLayout'

// Store Keeper Pages
import StoreKeeperDashboard from '../pages/storekeeper/Dashboard'
import StoreKeeperAssets from '../pages/storekeeper/Assets'
import StoreKeeperInventory from '../pages/storekeeper/Inventory'
import StoreKeeperStock from '../pages/storekeeper/Stock'
import StoreKeeperMaintenance from '../pages/storekeeper/Maintenance'
import StoreKeeperSettings from '../pages/storekeeper/Settings'
import StoreKeeperAlerts from '../pages/storekeeper/Alerts'      // <-- MPYA
import StoreKeeperReports from '../pages/storekeeper/Reports'    // <-- MPYA
import StoreKeeperProfile from '../pages/storekeeper/Profile'    // <-- MPYA
import { StoreKeeperLayout } from '../components/layouts/StoreKeeperLayout'

// System Admin Pages
import SystemAdminDashboard from '../pages/system/Dashboard'
import SystemAdminSettings from '../pages/system/Settings'
import SystemAdminBackup from '../pages/system/Backup'
import SystemAdminLogs from '../pages/system/Logs'
import SystemAdminSessions from '../pages/system/Sessions'
import SystemAdminCache from '../pages/system/Cache'
import SystemAdminErrors from '../pages/system/Errors'
import SystemAdminQueue from '../pages/system/Queue'
import SystemAdminApiKeys from '../pages/system/ApiKeys'
import SystemAdminProfile from '../pages/system/Profile'         // <-- MPYA
import SystemPlaceholder from '../pages/system/Placeholder'
import { SystemLayout } from '../components/layouts/SystemLayout'

// Matron Pages
import MatronDashboard from '../pages/matron/Dashboard'
import MatronDormitories from '../pages/matron/Dormitories'
import MatronBeds from '../pages/matron/Beds'
import MatronRollCall from '../pages/matron/RollCall'
import MatronLeaves from '../pages/matron/Leaves'           // <-- MPYA
import MatronSickBay from '../pages/matron/SickBay'
import MatronIncidents from '../pages/matron/Incidents'
import MatronInspections from '../pages/matron/Inspections' // <-- MPYA
import MatronMessages from '../pages/matron/Messages'       // <-- MPYA
import MatronReports from '../pages/matron/Reports'
import MatronProfile from '../pages/matron/Profile'         // <-- MPYA
import { MatronLayout } from '../components/layouts/MatronLayout'

import Profile from '../pages/Profile'
import { getHomePath } from '../utils/constants'
import { PrivateRoute } from './PrivateRoute'

const ROLE_ROUTES = [
  { path: '/admin', role: 'super_admin' },
]

const STUDENT_ROUTES = [
  { path: '/admin/students', role: 'super_admin' },
]

const SUBJECT_ROUTES = [
  { path: '/admin/subjects', role: 'super_admin' },
]

const TEACHER_ROUTES = [{ path: '/admin/teachers', role: 'super_admin' }]

const TIMETABLE_ROUTES = [
  { path: '/admin/timetables', role: 'super_admin' },
]

const MODULE_ROUTES = [
  { path: '/admin/parents', role: 'super_admin', element: <Parents /> },
  { path: '/admin/accountants', role: 'super_admin', element: <Accountants /> },
  { path: '/admin/fee-structure', role: 'super_admin', element: <FeeStructure /> },
  { path: '/admin/users', role: 'super_admin', element: <Users /> },
  { path: '/admin/finance', role: 'super_admin', element: <Finance /> },
  { path: '/admin/inventory', role: 'super_admin', element: <Inventory /> },
  { path: '/admin/reports', role: 'super_admin', element: <AdminReports /> },
  { path: '/admin/settings', role: 'super_admin', element: <Settings /> },
]

const SYSTEM_PLACEHOLDERS = []

function HomeRedirect() {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary" />
      </div>
    )
  }

  return <Navigate to={isAuthenticated ? getHomePath(user.role) : '/login'} replace />
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* ACCOUNTANT ROUTES */}
      <Route
        path="/accountant"
        element={
          <PrivateRoute roles={['accountant']}>
            <AccountantLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<AccountantDashboard />} />
        <Route path="students" element={<AccountantStudents />} />
        <Route path="payments" element={<AccountantPayments />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="control-numbers" element={<ControlNumbers />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="debts" element={<Debts />} />
        <Route path="reports" element={<Reports />} />
        <Route path="reconciliation" element={<AccountantReconciliation />} />  {/* <-- MPYA */}
        <Route path="profile" element={<AccountantProfile />} />                {/* <-- MPYA */}
      </Route>

      {/* STUDENT ROUTES */}
      <Route
        path="/student"
        element={
          <PrivateRoute roles={['student']}>
            <StudentLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="results" element={<StudentResults />} />
        <Route path="attendance" element={<StudentAttendance />} />
        <Route path="notes" element={<StudentNotes />} />
        <Route path="timetable" element={<StudentTimetable />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="assignments" element={<StudentAssignments />} />
        <Route path="report-card" element={<StudentReportCard />} />
        <Route path="certificates" element={<StudentCertificates />} />
        <Route path="announcements" element={<StudentAnnouncements />} />
      </Route>

      {/* TEACHER ROUTES */}
      <Route
        path="/teacher"
        element={
          <PrivateRoute roles={['teacher']}>
            <TeacherLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<TeacherDashboard />} />
        <Route path="students" element={<TeacherStudents />} />
        <Route path="subjects" element={<TeacherSubjects />} />
        <Route path="timetable" element={<TeacherTimetable />} />
        <Route path="attendance" element={<TeacherAttendance />} />
        <Route path="marks" element={<TeacherMarks />} />
        <Route path="notes" element={<TeacherNotes />} />
        <Route path="behavior" element={<TeacherBehavior />} />
        <Route path="messages" element={<TeacherMessages />} />
        <Route path="profile" element={<TeacherProfile />} />
      </Route>

      {/* PARENT ROUTES */}
      <Route
        path="/parent"
        element={
          <PrivateRoute roles={['parent']}>
            <ParentLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<ParentDashboard />} />
        <Route path="children" element={<Children />} />
        <Route path="children/:id" element={<ChildDetail />} />
        <Route path="payments" element={<Payments />} />
        <Route path="history" element={<History />} />
        <Route path="balance" element={<Balance />} />
        <Route path="statement" element={<ParentStatement />} />
        <Route path="announcements" element={<ParentAnnouncements />} />
        <Route path="messages" element={<ParentMessages />} />
        <Route path="gallery" element={<ParentGallery />} />
        <Route path="documents" element={<ParentDocuments />} />
        <Route path="report-card" element={<ParentReportCard />} />
        <Route path="profile" element={<ParentProfile />} />
      </Route>

      {/* ACADEMIC ROUTES */}
      <Route
        path="/academic"
        element={
          <PrivateRoute roles={['academic_teacher']}>
            <AcademicLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<AcademicDashboard />} />
        <Route path="teachers" element={<AcademicTeachers />} />
        <Route path="students" element={<AcademicStudents />} />
        <Route path="allocation" element={<AcademicAllocation />} /> {/* <-- MPYA */}
        <Route path="timetable" element={<AcademicTimetable />} />
        <Route path="exams" element={<AcademicExams />} />
        <Route path="results" element={<AcademicResults />} />
        <Route path="syllabus" element={<AcademicSyllabus />} />
        <Route path="announcements" element={<AcademicAnnouncements />} />
        <Route path="profile" element={<AcademicProfile />} />
      </Route>

      {/* STORE KEEPER ROUTES */}
      <Route
        path="/storekeeper"
        element={
          <PrivateRoute roles={['store_keeper']}>
            <StoreKeeperLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<StoreKeeperDashboard />} />
        <Route path="assets" element={<StoreKeeperAssets />} />
        <Route path="inventory" element={<StoreKeeperInventory />} />
        <Route path="stock" element={<StoreKeeperStock />} />
        <Route path="maintenance" element={<StoreKeeperMaintenance />} />
        <Route path="alerts" element={<StoreKeeperAlerts />} />          {/* <-- MPYA */}
        <Route path="reports" element={<StoreKeeperReports />} />        {/* <-- MPYA */}
        <Route path="settings" element={<StoreKeeperSettings />} />
        <Route path="profile" element={<StoreKeeperProfile />} />        {/* <-- MPYA */}
      </Route>

      {/* SYSTEM ADMIN ROUTES */}
      <Route
        path="/system"
        element={
          <PrivateRoute roles={['system_admin']}>
            <SystemLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<SystemAdminDashboard />} />
        <Route path="settings" element={<SystemAdminSettings />} />
        <Route path="backup" element={<SystemAdminBackup />} />
        <Route path="logs" element={<SystemAdminLogs />} />
        <Route path="sessions" element={<SystemAdminSessions />} />
        <Route path="cache" element={<SystemAdminCache />} />
        <Route path="errors" element={<SystemAdminErrors />} />
        <Route path="queue" element={<SystemAdminQueue />} />
        <Route path="api-keys" element={<SystemAdminApiKeys />} />
        <Route path="profile" element={<SystemAdminProfile />} />        {/* <-- MPYA */}
        {SYSTEM_PLACEHOLDERS.map(({ path, title, icon, description }) => (
          <Route
            key={path}
            path={path}
            element={<SystemPlaceholder title={title} icon={icon} description={description} />}
          />
        ))}
      </Route>

      {/* MATRON ROUTES */}
      <Route
        path="/matron"
        element={
          <PrivateRoute roles={['matron']}>
            <MatronLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<MatronDashboard />} />
        <Route path="dormitories" element={<MatronDormitories />} />
        <Route path="beds" element={<MatronBeds />} />
        <Route path="roll-call" element={<MatronRollCall />} />
        <Route path="leaves" element={<MatronLeaves />} />          {/* <-- MPYA */}
        <Route path="sick-bay" element={<MatronSickBay />} />
        <Route path="incidents" element={<MatronIncidents />} />
        <Route path="inspections" element={<MatronInspections />} /> {/* <-- MPYA */}
        <Route path="messages" element={<MatronMessages />} />       {/* <-- MPYA */}
        <Route path="reports" element={<MatronReports />} />
        <Route path="profile" element={<MatronProfile />} />         {/* <-- MPYA */}
      </Route>

      {/* ADMIN & OTHER ROUTES */}
      {ROLE_ROUTES.map(({ path, role }) => (
        <Route
          key={path}
          path={path}
          element={
            <PrivateRoute roles={[role]}>
              <Dashboard />
            </PrivateRoute>
          }
        />
      ))}

      {STUDENT_ROUTES.map(({ path, role }) => (
        <Route
          key={path}
          path={path}
          element={
            <PrivateRoute roles={[role]}>
              <Students />
            </PrivateRoute>
          }
        />
      ))}

      {SUBJECT_ROUTES.map(({ path, role }) => (
        <Route
          key={path}
          path={path}
          element={
            <PrivateRoute roles={[role]}>
              <Subjects />
            </PrivateRoute>
          }
        />
      ))}

      {TEACHER_ROUTES.map(({ path, role }) => (
        <Route
          key={path}
          path={path}
          element={
            <PrivateRoute roles={[role]}>
              <Teachers />
            </PrivateRoute>
          }
        />
      ))}

      {TIMETABLE_ROUTES.map(({ path, role }) => (
        <Route
          key={path}
          path={path}
          element={
            <PrivateRoute roles={[role]}>
              <Timetables />
            </PrivateRoute>
          }
        />
      ))}

      {MODULE_ROUTES.map(({ path, role, element }) => (
        <Route
          key={path}
          path={path}
          element={<PrivateRoute roles={[role]}>{element}</PrivateRoute>}
        />
      ))}

      <Route
        path="/profile"
        element={
          <PrivateRoute roles={['super_admin', 'system_admin', 'academic_teacher', 'teacher', 'accountant', 'store_keeper', 'matron', 'student', 'parent']}>
            <Profile />
          </PrivateRoute>
        }
      />

      <Route path="/" element={<HomeRedirect />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}