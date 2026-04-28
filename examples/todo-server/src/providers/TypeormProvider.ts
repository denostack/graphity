import { Provider, ProviderDescriptor } from "graphity";
import { resolve } from "path";
import { Connection, createConnection } from "typeorm";

export class TypeormProvider implements Provider {
  register(app: ProviderDescriptor): void {
    app.resolver(Connection, () => {
      return createConnection({
        type: "mysql",
        host: process.env.DB_HOST ?? "",
        port: +(process.env.DB_PORT ?? "3306"),
        database: process.env.DB_DATABASE ?? "",
        username: process.env.DB_USERNAME ?? "",
        password: process.env.DB_PASSWORD ?? "",
        synchronize: false,
        logging: false,
        entities: [
          resolve(__dirname, "../entities/*.js"),
        ],
      });
    });
  }

  async close(app: ProviderDescriptor) {
    (await app.resolve(Connection)).close();
  }
}
