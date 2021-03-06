import React from "react";
import PropTypes from "prop-types";
import { Route } from "react-router-dom";

import HomePage from "./components/pages/HomePage";
import LoginPage from "./components/pages/LoginPage";
import DashboardPage from "./components/pages/DashboardPage";
import ItemsPage from "./components/pages/ItemsPage";
import NewItemPage from "./components/pages/NewItemPage";
import InventoryPage from "./components/pages/InventoryPage";

import UserRoute from "./components/routes/UserRoute";
import GuestRoute from "./components/routes/GuestRoute";

const App = ({ location }) => (
  <div className="ui container">
    <Route location={location} path="/" exact component={HomePage} />
    <GuestRoute location={location} path="/login" exact component={LoginPage} />
    <UserRoute
      location={location}
      path="/dashboard"
      exact
      component={DashboardPage}
    />
    <UserRoute location={location} path="/items" exact component={ItemsPage} />
    <UserRoute
      location={location}
      path="/newitem"
      exact
      component={NewItemPage}
    />
    <UserRoute
      location={location}
      path="/inventory"
      exact
      component={InventoryPage}
    />
  </div>
);

App.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
};

export default App;
