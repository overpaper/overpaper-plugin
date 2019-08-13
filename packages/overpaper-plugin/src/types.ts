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

export interface ReplyHandlersValue {
  readonly resolve: (value?: any) => void;
  readonly reject: (reason?: any) => void;
}
