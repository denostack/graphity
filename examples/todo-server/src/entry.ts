import { ServerExpress } from "@graphity/server-express";

import { createGraphityApp } from "./app/createGraphityApp";

const PORT = process.env.PORT ?? "8080";

const server = new ServerExpress(createGraphityApp());
server.start(+PORT);
