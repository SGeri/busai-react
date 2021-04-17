import React from "react";
import PropTypes from "prop-types";
import { Form, Button, Message } from "semantic-ui-react";
import InlineError from "../messages/InlineError";

class LoginForm extends React.Component {
  state = {
    data: {
      username: "",
      password: "",
    },
    loading: false,
    errors: {},
  };

  onChange = (e) =>
    this.setState({
      data: { ...this.state.data, [e.target.name]: e.target.value },
    });

  validate = (data) => {
    const errors = {};

    if (!data.username) errors.username = "Nem lehet üres!";
    if (!data.password) errors.password = "Nem lehet üres!";

    return errors;
  };

  onSubmit = () => {
    const errors = this.validate(this.state.data);
    this.setState({ errors });

    const hasErrors = Object.keys(errors).length > 0;
    if (hasErrors) return;

    this.setState({ loading: true });
    this.props
      .submit(this.state.data)
      .catch((err) =>
        this.setState({ errors: err.response.data.errors, loading: false })
      );
  };

  render() {
    const { data, errors, loading } = this.state;
    return (
      <Form onSubmit={this.onSubmit} loading={loading}>
        {errors.global && (
          <Message negative>
            <Message.Header>Valami hiba történt</Message.Header>
            <p>{errors.global}</p>
          </Message>
        )}
        <Form.Field error={!!errors.username}>
          <label htmlFor="username">Felhasználónév</label>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Felhasználónév"
            value={data.username}
            onChange={this.onChange}
          />
          {errors.username && <InlineError text={errors.username} />}
        </Form.Field>

        <Form.Field error={!!errors.password}>
          <label htmlFor="password">Jelszó</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Jelszó"
            value={data.password}
            onChange={this.onChange}
          />
          {errors.password && <InlineError text={errors.password} />}
        </Form.Field>

        <Button primary sub="true">
          Bejelentkezés
        </Button>
      </Form>
    );
  }
}

LoginForm.propTypes = {
  submit: PropTypes.func.isRequired,
};

export default LoginForm;
