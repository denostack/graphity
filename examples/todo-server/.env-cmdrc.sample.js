module.exports = {
  dev: {
    NODE_ENV: "development",

    PORT: "8080",

    JWT_SIGNKEY: "",
    JWT_AUTH_EXPIRES: "1h",
    JWT_REFRESH_EXPIRES: "1d",

    DB_HOST: "localhost",
    DB_PORT: "3306",
    DB_DATABASE: "todomvc",
    DB_USERNAME: "todomvc",
    DB_PASSWORD: "",

    GITHUB_CLIENT_ID: "",
    GITHUB_CLIENT_SECRET: "",
    GITHUB_REDIRECT_URI: "",
  },
  prod: {
    NODE_ENV: "production",

    PORT: "8080",

    JWT_SIGNKEY: "",
    JWT_AUTH_EXPIRES: "7d",
    JWT_REFRESH_EXPIRES: "28d",

    DB_HOST: "something.rds.amazonaws.com",
    DB_PORT: "3306",
    DB_DATABASE: "todomvc",
    DB_USERNAME: "todomvc",
    DB_PASSWORD: "",

    GITHUB_CLIENT_ID: "",
    GITHUB_CLIENT_SECRET: "",
    GITHUB_REDIRECT_URI: "",
  },
};
