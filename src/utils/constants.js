export const ROLE_HOME = {
  super_admin: '/admin',
  system_admin: '/system',
  academic_teacher: '/academic',
  teacher: '/teacher',
  accountant: '/accountant',
  store_keeper: '/storekeeper',
  matron: '/matron',
  student: '/student',
  parent: '/parent',
}

export const ROLE_PREFIX = {
  super_admin: 'admin',
  system_admin: 'system',
  academic_teacher: 'academic',
  teacher: 'teacher',
  accountant: 'accountant',
  store_keeper: 'storekeeper',
  matron: 'matron',
  student: 'student',
  parent: 'parent',
}

export const ROLE_LABELS = {
  super_admin: 'Super Admin',
  system_admin: 'System Admin',
  academic_teacher: 'Academic Teacher',
  teacher: 'Teacher',
  accountant: 'Accountant',
  store_keeper: 'Store Keeper',
  matron: 'Matron',
  student: 'Student',
  parent: 'Parent',
}

export const getHomePath = (role) => ROLE_HOME[role] ?? '/login'

export const MODULES_BY_ROLE = {
  super_admin: ['Users', 'Students', 'Teachers', 'Parents', 'Accountants', 'Subjects', 'Timetables', 'Fee Structure', 'Finance', 'Inventory', 'Reports', 'Settings'],
  system_admin: ['Settings', 'System Logs', 'Backups', 'Academic Calendar', 'Departments'],
  academic_teacher: ['Subjects', 'Exams', 'Syllabus', 'Results', 'Timetables'],
  teacher: ['Students', 'Marks', 'Attendance', 'Notes', 'Behavior', 'Timetable'],
  accountant: ['Invoices', 'Payments', 'Expenses', 'Transactions', 'Debts', 'Reports'],
  store_keeper: ['Assets', 'Inventory', 'Stock', 'Depreciation', 'Maintenance'],
  matron: ['Dormitories', 'Rooms', 'Beds', 'Roll Call', 'Check In/Out', 'Sick Bay', 'Incidents', 'Messages'],
  student: ['Results', 'Attendance', 'Notes', 'Timetable', 'Certificates'],
  parent: ['Children', 'Payments', 'Balance', 'History', 'Timetable', 'Messages'],
}

export const STUDENT_ROLES = ['super_admin', 'system_admin', 'academic_teacher', 'teacher', 'accountant']

export const SCHOOL_LEVELS = {
  pre_primary: 'Pre-primary',
  primary: 'Primary',
  secondary: 'Secondary',
}

export function getModulePath(role, module) {
  if (module === 'Students' && STUDENT_ROLES.includes(role)) {
    return `${ROLE_HOME[role]}/students`
  }

  if (module === 'Teachers' && role === 'super_admin') {
    return '/admin/teachers'
  }

  if (module === 'Parents' && role === 'super_admin') {
    return '/admin/parents'
  }

  if (module === 'Accountants' && role === 'super_admin') {
    return '/admin/accountants'
  }

  if (module === 'Fee Structure' && role === 'super_admin') {
    return '/admin/fee-structure'
  }

  if (role === 'super_admin') {
    const adminPaths = {
      Users: '/admin/users',
      Finance: '/admin/finance',
      Inventory: '/admin/inventory',
      Reports: '/admin/reports',
      Settings: '/admin/settings',
    }

    if (adminPaths[module]) return adminPaths[module]
  }

  if (role === 'accountant') {
    const accountantPaths = {
      Invoices: '/accountant/invoices',
      Payments: '/accountant/control-numbers',
      Expenses: '/accountant/expenses',
      Transactions: '/accountant/transactions',
      Debts: '/accountant/debts',
      Reports: '/accountant/reports',
    }

    if (accountantPaths[module]) return accountantPaths[module]
  }

  if (role === 'parent') {
    const parentPaths = {
      Children: '/parent/children',
      Payments: '/parent/payments',
      Balance: '/parent/balance',
      History: '/parent/history',
    }

    if (parentPaths[module]) return parentPaths[module]
  }

  if (role === 'teacher') {
    const teacherPaths = {
      Marks: '/teacher/marks',
      Attendance: '/teacher/attendance',
      Notes: '/teacher/notes',
      Behavior: '/teacher/behavior',
    }

    if (teacherPaths[module]) return teacherPaths[module]
  }

  if (role === 'academic_teacher') {
    const academicPaths = {
      Exams: '/academic/exams',
      Syllabus: '/academic/syllabus',
      Results: '/academic/results',
    }

    if (academicPaths[module]) return academicPaths[module]
  }

  if (role === 'student') {
    const studentPaths = {
      Results: '/student/results',
      Attendance: '/student/attendance',
      Notes: '/student/notes',
    }

    if (studentPaths[module]) return studentPaths[module]
  }

  if (module === 'Subjects' && ['super_admin', 'academic_teacher'].includes(role)) {
    return `${ROLE_HOME[role]}/subjects`
  }

  if (module === 'Timetables' || module === 'Timetable') {
    const paths = {
      super_admin: '/admin/timetables',
      academic_teacher: '/academic/timetables',
      teacher: '/teacher/timetable',
      student: '/student/timetable',
      parent: '/parent/timetable',
    }

    return paths[role] ?? null
  }

  return null
}
