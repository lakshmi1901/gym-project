import "./dashboard.css";
import { Link, Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";

const Dashboard_main = () => {

  const location = useLocation();
  console.log(location.pathname);

  if(location.pathname == "/TemporaryDrawer/dashboard_main/expired"){

  }

  return (
    <div className="dashboard-layout">
      <div className="Dashboard_maina">
        <Link to="new-register">
          <button className="new_register">New Register</button>
        </Link>

        <Link to="expire3days">
          {/* <button className="acc_exp_3days">Accounts Going To Expire</button> */}
          <button className={location.pathname == "/TemporaryDrawer/dashboard_main/expire3days" ? "button_border1": "acc_exp_3days"}>Accounts Going To Expire <br /> within 3 days</button>
        </Link>

        <Link to="expired">
          {/* <button className="acc_expired">Accounts Expired</button> */}
          <button className={location.pathname == "/TemporaryDrawer/dashboard_main/expired" || location.pathname == "/TemporaryDrawer/dashboard_main" ? "button_border": "acc_expired"}>Accounts Expired</button>
        </Link>
      </div>

      <div className="dashboard-body">
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard_main;
