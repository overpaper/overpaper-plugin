import { RequestContextOauth } from "../request";

export const $oauth = (props: {
  provider: RequestContextOauth["provider"];
  scope?: RequestContextOauth["scope"];
}): {
  type: "oauth";
  provider: RequestContextOauth["provider"];
  scope?: RequestContextOauth["scope"];
} => ({ type: "oauth", ...props });
