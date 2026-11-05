import { lazy } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { AccountantLayout } from '../components/layouts/AccountantLayout'
import { StudentLayout } from '../components/layouts/StudentLayout'
import { TeacherLayout } from '../components/layouts/TeacherLayout'
import { ParentLayout } from '../components/layouts/ParentLayout'
import { AcademicLayout } from '../components/layouts/AcademicLayout'
import { StoreKeeperLayout } from '../components/layouts/StoreKeeperLayout'
import { SystemLayout } from '../components/layouts/SystemLayout'
import { MatronLayout } from '../components/layouts/MatronLayout'
import { getHomePath } from '../utils/constants'
import { PrivateRoute } from './PrivateRoute'

const AdminCategories = lazy(() => import('../pages/admin/Categories'))
const AdminCategoryDashboard = lazy(() => import('../pages/admin/Categories').then((module) => ({ default: module.AdminCategoryDashboard })))
const AdminClasses = lazy(() => import('../pages/admin/Classes'))                    // <-- MPYA
const Students = lazy(() => import('../pages/Students'))
const Subjects = lazy(() => import('../pages/Subjects'))
const Teachers = lazy(() => import('../pages/Teachers'))
const Timetables = lazy(() => import('../pages/Timetables'))
const Login = lazy(() => import('../pages/auth/Login'))
const NotFound = lazy(() => import('../pages/NotFound'))
const Parents = lazy(() => import('../pages/admin/Parents'))
const Accountants = lazy(() => import('../pages/admin/Accountants'))
const FeeStructure = lazy(() => import('../pages/admin/FeeStructure'))
const Users = lazy(() => import('../pages/admin/Users'))
const Finance = lazy(() => import('../pages/admin/Finance'))
const Inventory = lazy(() => import('../pages/admin/Inventory'))
const AdminReports = lazy(() => import('../pages/admin/Reports'))
const Settings = lazy(() => import('../pages/admin/Settings'))

// Accountant Pages
const AccountantDashboard = lazy(() => import('../pages/accountant/Dashboard'))
const AccountantStudents = lazy(() => import('../pages/accountant/Students'))
const AccountantPayments = lazy(() => import('../pages/accountant/Payments'))
const BillingReport = lazy(() => import('../pages/accountant/Billing'))
const StudentBilling = lazy(() => import('../pages/student/Billing'))
const Invoices = lazy(() => import('../pages/accountant/Invoices'))
const Expenses = lazy(() => import('../pages/accountant/Expenses'))
const Debts = lazy(() => import('../pages/accountant/Debts'))
const Transactions = lazy(() => import('../pages/accountant/Transactions'))
const Reports = lazy(() => import('../pages/accountant/Reports'))
const ControlNumbers = lazy(() => import('../pages/accountant/ControlNumbers'))
const AccountantReconciliation = lazy(() => import('../pages/accountant/Reconciliation'))  // <-- MPYA
const AccountantProfile = lazy(() => import('../pages/accountant/Profile'))                // <-- MPYA

// Student Pages
const StudentDashboard = lazy(() => import('../pages/student/Dashboard'))
const StudentResults = lazy(() => import('../pages/student/Results'))
const StudentAttendance = lazy(() => import('../pages/student/Attendance'))
const StudentNotes = lazy(() => import('../pages/student/Notes'))
const StudentTimetable = lazy(() => import('../pages/student/Timetable'))
const StudentProfile = lazy(() => import('../pages/student/Profile'))
const StudentAssignments = lazy(() => import('../pages/student/Assignments'))
const StudentReportCard = lazy(() => import('../pages/student/ReportCard'))
const StudentCertificates = lazy(() => import('../pages/student/Certificates'))
const StudentAnnouncements = lazy(() => import('../pages/student/Announcements'))

// Teacher Pages
const TeacherDashboard = lazy(() => import('../pages/teacher/Dashboard'))
const TeacherAttendance = lazy(() => import('../pages/teacher/Attendance'))
const TeacherMarks = lazy(() => import('../pages/teacher/Marks'))
const TeacherNotes = lazy(() => import('../pages/teacher/Notes'))
const TeacherBehavior = lazy(() => import('../pages/teacher/Behavior'))
const TeacherStudents = lazy(() => import('../pages/teacher/Students'))
const TeacherSubjects = lazy(() => import('../pages/teacher/Subjects'))
const TeacherTimetable = lazy(() => import('../pages/teacher/Timetable'))
const TeacherMessages = lazy(() => import('../pages/teacher/Messages'))
const TeacherProfile = lazy(() => import('../pages/teacher/Profile'))

// Parent Pages
const ParentSchools = lazy(() => import('../pages/parent/Schools'))
const ParentDashboard = lazy(() => import('../pages/parent/Dashboard'))
const Children = lazy(() => import('../pages/parent/Children'))
const ChildDetail = lazy(() => import('../pages/parent/ChildDetail'))
const Payments = lazy(() => import('../pages/parent/Payments'))
const History = lazy(() => import('../pages/parent/History'))
const Balance = lazy(() => import('../pages/parent/Balance'))
const ParentStatement = lazy(() => import('../pages/parent/Statement'))
const ParentAnnouncements = lazy(() => import('../pages/parent/Announcements'))
const ParentMessages = lazy(() => import('../pages/parent/Messages'))
const ParentGallery = lazy(() => import('../pages/parent/Gallery'))
const ParentDocuments = lazy(() => import('../pages/parent/Documents'))
const ParentReportCard = lazy(() => import('../pages/parent/ReportCard'))
const ParentProfile = lazy(() => import('../pages/parent/Profile'))

// Academic Pages (MPYA)
const AcademicDashboard = lazy(() => import('../pages/academic/Dashboard'))
const AcademicExams = lazy(() => import('../pages/academic/Exams'))
const AcademicResults = lazy(() => import('../pages/academic/Results'))
const AcademicSyllabus = lazy(() => import('../pages/academic/Syllabus'))
const AcademicTeachers = lazy(() => import('../pages/academic/Teachers'))
const AcademicStudents = lazy(() => import('../pages/academic/Students'))
const AcademicTimetable = lazy(() => import('../pages/academic/Timetable'))
const AcademicAnnouncements = lazy(() => import('../pages/academic/Announcements'))
const AcademicProfile = lazy(() => import('../pages/academic/Profile'))
const AcademicAllocation = lazy(() => import('../pages/academic/Allocation')) // <-- MPYA

// Store Keeper Pages
const StoreKeeperDashboard = lazy(() => import('../pages/storekeeper/Dashboard'))
const StoreKeeperAssets = lazy(() => import('../pages/storekeeper/Assets'))
const StoreKeeperInventory = lazy(() => import('../pages/storekeeper/Inventory'))
const StoreKeeperStock = lazy(() => import('../pages/storekeeper/Stock'))
const StoreKeeperMaintenance = lazy(() => import('../pages/storekeeper/Maintenance'))
const StoreKeeperSettings = lazy(() => import('../pages/storekeeper/Settings'))
const StoreKeeperAlerts = lazy(() => import('../pages/storekeeper/Alerts'))      // <-- MPYA
const StoreKeeperReports = lazy(() => import('../pages/storekeeper/Reports'))    // <-- MPYA
const StoreKeeperProfile = lazy(() => import('../pages/storekeeper/Profile'))    // <-- MPYA

// System Admin Pages
const SystemSchools = lazy(() => import('../pages/system/Schools'))
const SystemAdminDashboard = lazy(() => import('../pages/system/Dashboard'))
const SystemAdminSettings = lazy(() => import('../pages/system/Settings'))
const SystemAdminBackup = lazy(() => import('../pages/system/Backup'))
const SystemAdminLogs = lazy(() => import('../pages/system/Logs'))
const SystemAdminSessions = lazy(() => import('../pages/system/Sessions'))
const SystemAdminCache = lazy(() => import('../pages/system/Cache'))
const SystemAdminErrors = lazy(() => import('../pages/system/Errors'))
const SystemAdminQueue = lazy(() => import('../pages/system/Queue'))
const SystemAdminApiKeys = lazy(() => import('../pages/system/ApiKeys'))
const SystemAdminProfile = lazy(() => import('../pages/system/Profile'))         // <-- MPYA
const SystemPlaceholder = lazy(() => import('../pages/system/Placeholder'))

// Matron Pages
const MatronDashboard = lazy(() => import('../pages/matron/Dashboard'))
const MatronDormitories = lazy(() => import('../pages/matron/Dormitories'))
const MatronBeds = lazy(() => import('../pages/matron/Beds'))
const MatronRollCall = lazy(() => import('../pages/matron/RollCall'))
const MatronLeaves = lazy(() => import('../pages/matron/Leaves'))           // <-- MPYA
const MatronSickBay = lazy(() => import('../pages/matron/SickBay'))
const MatronIncidents = lazy(() => import('../pages/matron/Incidents'))
const MatronInspections = lazy(() => import('../pages/matron/Inspections')) // <-- MPYA
const MatronMessages = lazy(() => import('../pages/matron/Messages'))       // <-- MPYA
const MatronReports = lazy(() => import('../pages/matron/Reports'))
const MatronProfile = lazy(() => import('../pages/matron/Profile'))         // <-- MPYA

const Profile = lazy(() => import('../pages/Profile'))

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
  { path: '/admin/classes', role: 'super_admin', element: <AdminClasses /> },  // <-- MPYA
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
        <Route path="billing" element={<BillingReport />} />
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
        <Route path="billing" element={<StudentBilling />} />
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
            <Outlet />
          </PrivateRoute>
        }
      >
        <Route index element={<ParentSchools />} />
        <Route element={<ParentLayout />}>
          <Route path="dashboard" element={<ParentDashboard />} />
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
        <Route path="schools" element={<SystemSchools />} />
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
              <AdminCategories />
            </PrivateRoute>
          }
        />
      ))}

      <Route
        path="/admin/dashboard"
        element={<PrivateRoute roles={['super_admin']}><AdminCategoryDashboard /></PrivateRoute>}
      />

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