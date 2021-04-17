import React from "react";
import { Link } from "react-router-dom";
import { Menu } from "semantic-ui-react";

class Navbar extends React.Component {
  state = {};

  handleItemClick = (e, { name }) => this.setState({ activeItem: name });

  render() {
    const { activeItem } = this.state;

    return (
      <div>
        <div style={{ padding: "10px" }}>
          <Menu
            style={{ padding: "5px" }}
            size={"large"}
            style={{ justifyContent: true }}
          >
            <Link to="/dashboard">
              <Menu.Item
                name="dashboard"
                active={activeItem === "dashboard"}
                onClick={this.handleItemClick}
                style={{ paddingLeft: "50px", paddingRight: "50px" }}
              >
                Főoldal
              </Menu.Item>
            </Link>

            <Link to="/items">
              <Menu.Item
                name="items"
                active={activeItem === "items"}
                onClick={this.handleItemClick}
                style={{ paddingLeft: "50px", paddingRight: "50px" }}
              >
                Termékek
              </Menu.Item>
            </Link>

            <Link to="/newitem">
              <Menu.Item
                name="newitem"
                active={activeItem === "newitem"}
                onClick={this.handleItemClick}
                style={{ paddingLeft: "50px", paddingRight: "50px" }}
              >
                Új termék
              </Menu.Item>
            </Link>

            <Link to="/inventory">
              <Menu.Item
                name="inventory"
                active={activeItem === "inventory"}
                onClick={this.handleItemClick}
                style={{ paddingLeft: "50px", paddingRight: "50px" }}
              >
                Leltár
              </Menu.Item>
            </Link>

            <Link to="/">
              <Menu.Item
                name="logout"
                active={activeItem === "logout"}
                onClick={this.handleItemClick}
                style={{ paddingLeft: "50px", paddingRight: "50px" }}
              >
                Kijelentkezés
              </Menu.Item>
            </Link>
          </Menu>
        </div>
      </div>
    );
  }
}

export default Navbar;
