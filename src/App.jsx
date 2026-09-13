import { Navigate, Route, Routes } from 'react-router-dom'
import { useTeacherAuth } from './hooks/useTeacherAuth'
import { useStudentSession } from './hooks/useStudentSession'
import RoleGate from './pages/RoleGate'
import LoginTeacher from './pages/LoginTeacher'
import LoginStudent from './pages/LoginStudent'
import StudentShell from './pages/student/StudentShell'
import CheckinPage from './pages/student/CheckinPage'
import MyRecordsPage from './pages/student/MyRecordsPage'
import CollectionPage from './pages/student/CollectionPage'
import TeacherDashboard from './pages/teacher/TeacherDashboard'
import StudentDetailPage from './pages/teacher/StudentDetailPage'
import SettingsPage from './pages/teacher/SettingsPage'

export default function App() {
  const { teacher, loading: teacherLoading } = useTeacherAuth()
  const { session } = useStudentSession()

  if (teacherLoading) return null

  return (
    <Routes>
      <Route path="/" element={<RoleGate teacher={teacher} session={session} />} />
      <Route path="/login/teacher" element={<LoginTeacher />} />
      <Route path="/login/student" element={<LoginStudent />} />

      <Route
        path="/app"
        element={session ? <StudentShell session={session} /> : <Navigate to="/login/student" replace />}
      >
        <Route index element={<Navigate to="checkin" replace />} />
        <Route path="checkin" element={<CheckinPage session={session} />} />
        <Route path="records" element={<MyRecordsPage session={session} />} />
        <Route path="collection" element={<CollectionPage session={session} />} />
      </Route>

      <Route
        path="/teacher"
        element={teacher ? <TeacherDashboard teacher={teacher} /> : <Navigate to="/login/teacher" replace />}
      />
      <Route
        path="/teacher/student/:studentId"
        element={teacher ? <StudentDetailPage teacher={teacher} /> : <Navigate to="/login/teacher" replace />}
      />
      <Route
        path="/teacher/settings"
        element={teacher ? <SettingsPage teacher={teacher} /> : <Navigate to="/login/teacher" replace />}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
