import nanoid from "nanoid/non-secure";

const replyHandlers = new Map<string, ReplyHandlersValue>();

export function listen(
  callback: (request: Request, response: Response) => Promise<void>
) {
  (self as DedicatedWorkerGlobalScope).addEventListener("message", event => {
    const message: Message<any> | MessageReply<any, any> = event.data;
    switch (message.type) {
      case "ipc-message": {
        const request: Request = {
          params: message.args[1],
          message: message
        };
        const response: Response = {
          reply: payload => reply(message, payload),
          error: payload => error(message, payload)
        };
        callback(request, response).catch(err =>
          error(message, err.toString())
        );
        break;
      }
      case "ipc-message-reply": {
        const handler = replyHandlers.get(message.uid);
        if (handler) {
          replyHandlers.delete(message.uid);
          handler.resolve(message as MessageReply<any, any>);
        }
        break;
      }
      case "ipc-message-reply-error": {
        const handler = replyHandlers.get(message.uid);
        if (handler) {
          replyHandlers.delete(message.uid);
          handler.reject(message as MessageReply<any, any>);
        }
        break;
      }
      default:
        break;
    }
  });
}

export function send<Args extends any[], Payload>(func: string, ...args: Args) {
  return new Promise<MessageReply<Args, Payload>>((resolve, reject) => {
    const message: Message<Args> = {
      uid: nanoid(),
      args,
      func,
      target: "plugins",
      origin: "plugins",
      process: "worker",
      type: "ipc-message"
    };
    replyHandlers.set(message.uid, { resolve, reject });
    (self as DedicatedWorkerGlobalScope).postMessage(message);
  });
}

export interface Request {
  readonly params: PluginRequestObject;
  readonly message: Message<PluginRequestObject>;
}

export type PluginRequestObject =
  | PluginRequestObjectQuery
  | PluginRequestObjectForm;

export interface PluginRequestObjectBase<T> {
  readonly type: T;
  uri: string;
  plugin: string;
  query: string;
}

export type PluginRequestObjectQuery = PluginRequestObjectBase<"query">;

export interface PluginRequestObjectForm
  extends PluginRequestObjectBase<"form"> {
  readonly body: { [key: string]: any };
}

export interface Response {
  readonly reply: (payload: ResponsePayload) => void;
  readonly error: (payload: any) => void;
}

export type ResponsePayloadContentItem =
  | { type: "text"; text: string | number }
  | { type: "link"; text: string; url: string }
  | { type: "icon"; icon: string }
  | {
      type: "button";
      label: string;
      action: string | number | JSON;
      icon?: string;
    }
  | {
      type: "form";
      body: {
        input: "text" | "number" | "hidden";
        name: string;
        value?: string;
        placeholder?: string;
      }[];
    };

export type ResponsePayloadContent = ResponsePayloadContentItem[];

export interface ResponsePayload {
  readonly type: "inline";
  readonly content: any;
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

function reply<Args extends any[], Payload>(
  message: Message<Args>,
  payload: Payload
) {
  const replyMessage: MessageReply<Args, Payload> = {
    ...message,
    payload,
    type: "ipc-message-reply",
    process: "worker"
  };
  (self as DedicatedWorkerGlobalScope).postMessage(replyMessage);
}

function error<Args extends any[]>(message: Message<Args>, payload: any) {
  const errorMessage: MessageReply<Args, any> = {
    ...message,
    payload,
    type: "ipc-message-reply-error",
    process: "worker"
  };
  (self as DedicatedWorkerGlobalScope).postMessage(errorMessage);
}
