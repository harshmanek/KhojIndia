import { CssBaseline, ThemeProvider } from "@mui/material";
import { Provider } from "react-redux";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Checkout from "./pages/Checkout";
import store from "./store/index";
import theme from "./theme";
import AuthLoader from "./components/AuthLoader";
import Login from "./pages/Login";
import Register from "./pages/Register";
import LogoutButton from "./components/LogoutButton";

function App() {
  return (
    <Provider store={store}>
      <AuthLoader>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <Routes>
              {/* <Route path="/" element={<Home />} /> */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="logout" element={<LogoutButton/>}/>
              {/* <Route path="/unauthorized" element={<Unauthorised />} /> */}
              {/* <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["TRAVELLER", "ADMIN"]}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              /> */}
            </Routes>
          </Router>
        </ThemeProvider>
      </AuthLoader>
    </Provider>
  );
}

export default App;
