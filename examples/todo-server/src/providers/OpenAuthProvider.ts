import { GithubOAuth } from "@openauth/github";
import { Provider, ProviderDescriptor } from "graphity";

export class OpenAuthProvider implements Provider {
  register(app: ProviderDescriptor): void {
    app.resolver(GithubOAuth, () => {
      return new GithubOAuth({
        clientId: process.env.GITHUB_CLIENT_ID || "",
        clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
        redirectUri: process.env.GITHUB_REDIRECT_URI || "",
        scope: [
          "read:user",
          "user:email",
        ],
      });
    });
  }
}
