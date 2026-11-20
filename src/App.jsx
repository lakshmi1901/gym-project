import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Getstartpage from "./pages/homepage/Getstartpage";
import Loginpage from "./pages/loginpages/Loginpage";
import Signuppage from "./pages/signup/Signuppage";
import ProtectedRoute from "./Common/ProtectedRoute.jsx";
import Forgetpassword from "./pages/forgetpassword/Forgetpassword";
import Otppage from "./pages/otppage/Otppage";
import Resetpassword from "./pages/resetpassword/Resetpassword";

import TemporaryDrawer from "./pages/Dashboards/Drawer/Drawer";

import Dashboard_main from "./pages/Dashboards/dashboardmain/Dashboard_main";
import Newregister from "./pages/Dashboards/dashboard_newregister/Newregister";
import Expire3days from "./pages/Dashboards/dashboard_expire_3days/Expire3days.jsx";
import AccountExpired from "./pages/Dashboards/dashboard_accounts_expired/Accountsexpired.jsx";

import Viewregister from "./pages/view_register/Viewregister";
import Paymenthistory from "./pages/paymentHistory/Paymenthistory";
import Popup from "./Common/popupcard/Popup.jsx";
import Userprofilepop from "./Common/userProfilePopup/Userprofilepop.jsx";
import DateFilter from "./Common/DateFilter/DateFilter.jsx";

function App() {
  return (

    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Getstartpage />} />

        <Route path="/loginpage" element={<Loginpage />} />

        <Route path="/signup" element={<Signuppage />} />

        <Route path="/forgetpassword" element={<Forgetpassword />} />

        <Route path="/otppage" element={<Otppage />} />

        <Route path="/resetpassword" element={<Resetpassword />} />

        <Route
          path="/TemporaryDrawer"
          element={
            <ProtectedRoute>
              <TemporaryDrawer />
            </ProtectedRoute>
          }
        >

          <Route index element={<Navigate to="dashboard_main" replace />} />

          <Route path="dashboard_main" element={<Dashboard_main />}>

            <Route index element={<AccountExpired />} />

            <Route path="new-register" element={<Newregister />} />


            <Route path="expire3days" element={<Expire3days />} />

            <Route path="expired" element={<AccountExpired />} />

          </Route>

          <Route path="viewregistered" element={<Viewregister />} />

          <Route path="paymenthistory" element={<Paymenthistory />} />
          
        </Route>

      </Routes>
    </BrowserRouter>


    
  );
}

export default App;