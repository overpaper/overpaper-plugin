import { Plugin } from "../types";

export const $oauth = (props: {
  provider: Plugin.Request.ContextOauth["provider"];
  scope: Plugin.Request.ContextOauth["scope"];
}): {
  type: "oauth";
  provider: Plugin.Request.ContextOauth["provider"];
  scope: Plugin.Request.ContextOauth["scope"];
} => ({ type: "oauth", ...props });
