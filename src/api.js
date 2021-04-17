import axios from "axios";

export default {
  user: {
    login: (credentials) =>
      axios
        .post("http://88.151.99.76:4000/api/auth", { credentials })
        .then((res) => res.data.user),
  },
};
