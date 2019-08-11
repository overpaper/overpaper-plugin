import { Message } from "./types";

export interface Request {
  readonly context: RequestContext;
  readonly message: Message<RequestContext>;
}

export type RequestContext =
  | RequestContextQuery
  | RequestContexAction
  | RequestContextForm
  | RequestContextOauth;

export interface PluginContext<T> {
  readonly type: T;
  uri: string;
  plugin: string;
  query: string;
  state?: any;
}

export type RequestContextQuery = PluginContext<"query">;

export interface RequestContexAction extends PluginContext<"action"> {
  readonly action: string | number | { [key: string]: any };
}

export interface RequestContextForm extends PluginContext<"form"> {
  readonly body: { [key: string]: any };
}

export interface RequestContextOauth extends PluginContext<"oauth"> {
  readonly provider: "github" | "google";
  readonly scope?: string;
}
