import { $el } from "./elements";

export namespace Plugin {
  export interface State {
    [key: string]: any;
  }

  export interface Message<Args> {
    readonly uid: string;
    readonly args: Args;
    readonly func: string;
    readonly origin: "server" | "client" | "plugins" | "main";
    readonly process: "iframe" | "worker";
    readonly target: "server" | "client" | "plugins" | "main";
    readonly type:
      | "ipc-message"
      | "ipc-message-reply"
      | "ipc-message-reply-error";
  }

  export interface MessageReply<Args, Payload> extends Message<Args> {
    readonly payload: Payload;
  }

  export namespace Request {
    export interface Body<S extends State = any> {
      readonly context: Context<S>;
      readonly message: Message<Context<S>>;
    }

    export interface BaseContext<T, S extends { [key: string]: any } = any> {
      readonly type: T;
      key: string;
      uri: string;
      plugin: string;
      query: string;
      state: S;
    }

    export type Context<S extends State = any> =
      | ContextQuery<S>
      | ContexAction<S>
      | ContextForm<S>
      | ContextOauth<S>
      | ContextCleanup<S>;

    export type ContextQuery<S extends State = any> = BaseContext<"query", S>;

    export interface ContexAction<
      A extends { [key: string]: any } = any,
      S extends State = any
    > extends BaseContext<"action", S> {
      readonly action: A;
    }

    export interface ContextForm<
      B extends { [key: string]: any } = any,
      S extends State = any
    > extends BaseContext<"form", S> {
      readonly body: B;
    }

    export interface ContextOauth<S extends State = any>
      extends BaseContext<"oauth", S> {
      readonly provider: "github" | "google";
      readonly scope: string;
    }

    export type ContextCleanup<S extends State = any> = BaseContext<
      "cleanup",
      S
    >;
  }

  export namespace Response {
    export interface Wrapper<S extends State = any> {
      readonly reply: (args: { body: Body; state: S }) => void;
      readonly error: (args: { error: any; state: S }) => void;
    }

    export type Body = BodyInline;

    export interface BodyInline {
      readonly type: "inline";
      readonly content: BodyInlineContent;
    }

    export type BodyInlineContent = BodyInlineContentElement[];

    export type BodyInlineContentElement = ReturnType<
      typeof $el[keyof typeof $el]
    >;

    export interface ReplyPayload<S extends State = any> {
      readonly body: Body;
      readonly state: S;
    }
  }
}
