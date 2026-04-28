export default {
  head: {
    title: "TodoMVC",
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { hid: "description", name: "description", content: "" },
    ],
    link: [
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
    ],
  },
  css: [
    { src: "todomvc-app-css/index.css" },
  ],
  modules: [
    "@nuxtjs/apollo",
  ],
  apollo: {
    clientConfigs: {
      default: {
        httpEndpoint: "http://localhost:8007/graphql",
        wsEndpoint: "ws://localhost:8007/graphql",
      },
    },
  },
};
