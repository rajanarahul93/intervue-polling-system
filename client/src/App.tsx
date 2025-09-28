import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import { SocketProvider } from "./context/SocketContext";
import LandingPage from "./components/LandingPage";
import TeacherDashboard from "./components/TeacherDashboard";
import StudentDashboard from "./components/StudentDashboard";
import ErrorBoundary from "./components/ErrorBoundary";
import "./styles/globalStyles.css";

function App() {
  return (
    <Provider store={store}>
      <SocketProvider>
        <ErrorBoundary>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/teacher/:name" element={<TeacherDashboard />} />
                <Route path="/student/:name" element={<StudentDashboard />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Router>
        </ErrorBoundary>
      </SocketProvider>
    </Provider>
  );
}

export default App;