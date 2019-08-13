import { Message, State } from "./types";

export interface Request<S extends State = any> {
  readonly context: RequestContext<S>;
  readonly message: Message<RequestContext<S>>;
}

export type RequestContext<S extends State = any> =
  | RequestContextQuery<S>
  | RequestContexAction<S>
  | RequestContextForm<S>
  | RequestContextOauth<S>
  | RequestContextCleanup<S>;

export interface PluginContext<T, S extends { [key: string]: any } = any> {
  readonly type: T;
  key: string;
  uri: string;
  plugin: string;
  query: string;
  state: S;
}

export type RequestContextQuery<S extends State = any> = PluginContext<
  "query",
  S
>;

export interface RequestContexAction<
  A extends { [key: string]: any } = any,
  S extends State = any
> extends PluginContext<"action", S> {
  readonly action: A;
}

export interface RequestContextForm<
  B extends { [key: string]: any } = any,
  S extends State = any
> extends PluginContext<"form", S> {
  readonly body: B;
}

export interface RequestContextOauth<S extends State = any>
  extends PluginContext<"oauth", S> {
  readonly provider: "github" | "google";
  readonly scope: string;
}

export type RequestContextCleanup<S extends State = any> = PluginContext<
  "cleanup",
  S
>;
