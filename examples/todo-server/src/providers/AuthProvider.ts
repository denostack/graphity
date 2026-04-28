import { AuthBuilder, Provider, ProviderDescriptor } from "graphity";
import { JwtAuthBuilder } from "graphity/lib/auth/drivers/jwt";

export class AuthProvider implements Provider {
  register(app: ProviderDescriptor): void {
    app.resolver(AuthBuilder, () => {
      return new JwtAuthBuilder({
        security: {
          algorithm: "HS256",
          secret: process.env.JWT_SIGNKEY || "",
        },
        accessToken: {
          expiresIn: "1d",
        },
        refreshToken: {
          expiresIn: "14d",
        },
      });
    });
  }
}
