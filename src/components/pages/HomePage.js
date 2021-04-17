import React from "react";
import PropTypes from "prop-types";
import { Button } from "semantic-ui-react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import * as actions from "../../actions/auth";

const HomePage = ({ isAuthenticated, logout }) => (
  <div>
    <h1>Busai Barkács</h1>
    {isAuthenticated ? (
      <div>
        <h4>Biztosan ki szeretnél lépni?</h4>
        <Button onClick={() => logout()}>Kijelentkezés</Button>
        <Link
          style={{ marginRight: "20px", marginBottom: "30px" }}
          to="/dashboard"
        >
          <Button>Vissza a főoldalra</Button>
        </Link>
      </div>
    ) : (
      <Link to="/login">
        <Button>Bejelentkezés</Button>
      </Link>
    )}
  </div>
);

HomePage.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  logout: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    isAuthenticated: !!state.user.token,
  };
}

export default connect(mapStateToProps, { logout: actions.logout })(HomePage);
