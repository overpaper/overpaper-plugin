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
          context: message.args[1],
          message: message
        };
        const response: Response = {
          reply: ({ content, state }) => reply(message, content, state),
          error: ({ error, state }) => error(message, error, state)
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

const $input = ({
  type,
  ...props
}: {
  type: "text" | "number" | "hidden";
  name: string;
  value?: string;
  placeholder?: string;
}): {
  type: "input";
  input: "text" | "number" | "hidden";
  name: string;
  value?: string;
  placeholder?: string;
} => ({
  type: "input",
  input: type,
  ...props
});

export const $el = {
  text: (props: {
    text: string | number;
  }): { type: "text"; text: string | number } => ({
    type: "text",
    ...props
  }),
  link: (props: {
    text: string | number;
    url: string;
  }): { type: "link"; text: string | number; url: string } => ({
    type: "link",
    ...props
  }),
  icon: (props: { icon: string }): { type: "icon"; icon: string } => ({
    type: "icon",
    ...props
  }),
  button: (props: {
    label?: string | number;
    action: string | number | JSON;
    icon?: string;
  }): {
    type: "button";
    label?: string | number;
    action: string | number | JSON;
    icon?: string;
  } => ({ type: "button", ...props }),
  input: $input,
  form: (props: {
    body: ReturnType<typeof $input>[];
  }): {
    type: "form";
    body: ReturnType<typeof $input>[];
  } => ({ type: "form", ...props })
};

export const $content = {
  inline: (
    content: ResponsePayloadInlineContent
  ): { type: "inline"; content: ResponsePayloadInlineContent } => ({
    type: "inline",
    content
  })
};

export interface Request {
  readonly context: RequestContext;
  readonly message: Message<RequestContext>;
}

export type RequestContext = RequestContextQuery | RequestContextForm;

export interface PluginContextBase<T> {
  readonly type: T;
  uri: string;
  plugin: string;
  query: string;
  state?: any;
}

export type RequestContextQuery = PluginContextBase<"query">;

export interface RequestContextForm extends PluginContextBase<"form"> {
  readonly body: { [key: string]: any };
}

export interface Response {
  readonly reply: (args: { content: ResponsePayload; state?: any }) => void;
  readonly error: (args: { error: any; state?: any }) => void;
}

export type ResponsePayloadInlineContentItem = ReturnType<
  typeof $el[keyof typeof $el]
>;

export type ResponsePayloadInlineContent = ResponsePayloadInlineContentItem[];

export interface ResponsePayloadInline {
  readonly type: "inline";
  readonly content: ResponsePayloadInlineContent;
}

export type ResponsePayload = ResponsePayloadInline;

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

function reply<Args extends any[]>(
  message: Message<Args>,
  content: ResponsePayload,
  state?: any
) {
  const replyMessage: MessageReply<
    Args,
    { content: ResponsePayload; state?: any }
  > = {
    ...message,
    payload: { content, state },
    type: "ipc-message-reply",
    process: "worker"
  };
  (self as DedicatedWorkerGlobalScope).postMessage(replyMessage);
}

function error<Args extends any[]>(
  message: Message<Args>,
  error: any,
  state?: any
) {
  const errorMessage: MessageReply<Args, any> = {
    ...message,
    payload: { error, state },
    type: "ipc-message-reply-error",
    process: "worker"
  };
  (self as DedicatedWorkerGlobalScope).postMessage(errorMessage);
}
