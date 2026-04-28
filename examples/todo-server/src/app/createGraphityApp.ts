import { Graphity } from "graphity";

import { AuthProvider } from "../providers/AuthProvider";
import { OpenAuthProvider } from "../providers/OpenAuthProvider";
import { TypeormProvider } from "../providers/TypeormProvider";
import { AuthResolver } from "../resolvers/AuthResolver";
import { TodoResolver } from "../resolvers/TodoResolver";

export function createGraphityApp() {
  const graphity = new Graphity({
    resolvers: [
      AuthResolver,
      TodoResolver,
    ],
  });

  graphity.register(new AuthProvider());
  graphity.register(new OpenAuthProvider());
  graphity.register(new TypeormProvider());

  return graphity;
}
