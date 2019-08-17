import nanoid from "nanoid/non-secure";
import { $el, $body } from "./elements";
import { Plugin } from "./types";

const replyHandlers = new Map<string, ReplyHandlersValue>();

export { Plugin, $el, $body };

export function listen<S extends Plugin.State = any>(
  callback: (
    request: Plugin.Request.Body<S>,
    response: Plugin.Response.Wrapper<S>
  ) => Promise<void>
) {
  (self as DedicatedWorkerGlobalScope).addEventListener("message", event => {
    const message: Plugin.Message<any> | Plugin.MessageReply<any, any> =
      event.data;
    switch (message.type) {
      case "ipc-message": {
        const req: Plugin.Request.Body<S> = {
          context: message.args[0]
        };
        const res: Plugin.Response.Wrapper<S> = {
          reply: ({ body, state }) => responseReply(message, body, state),
          error: ({ error, state }) => responseError(message, error, state)
        };
        callback(req, res).catch(err =>
          responseError(message, err.toString(), req.context.state)
        );
        break;
      }
      case "ipc-message-reply": {
        const handler = replyHandlers.get(message.uid);
        if (handler) {
          replyHandlers.delete(message.uid);
          handler.resolve(message as Plugin.MessageReply<any, any>);
        }
        break;
      }
      case "ipc-message-reply-error": {
        const handler = replyHandlers.get(message.uid);
        if (handler) {
          replyHandlers.delete(message.uid);
          handler.reject(message as Plugin.MessageReply<any, any>);
        }
        break;
      }
      default:
        break;
    }
  });
}

export function send<Args extends any[], Payload>(func: string, ...args: Args) {
  return new Promise<Plugin.MessageReply<Args, Payload>>((resolve, reject) => {
    const message: Plugin.Message<Args> = {
      uid: nanoid(),
      args,
      func,
      target: "client",
      origin: "client",
      process: "worker",
      type: "ipc-message"
    };
    replyHandlers.set(message.uid, { resolve, reject });
    (self as DedicatedWorkerGlobalScope).postMessage(message);
  });
}

export function push<S extends Plugin.State = any>(
  key: string,
  payload: Plugin.Response.ReplyPayload<S>
) {
  return send("push", key, payload);
}

function responseReply<Args extends any[], S extends Plugin.State = any>(
  message: Plugin.Message<Args>,
  body: Plugin.Response.Body,
  state: S
) {
  const replyMessage: Plugin.MessageReply<
    Args,
    Plugin.Response.ReplyPayload<S>
  > = {
    ...message,
    payload: { body, state },
    type: "ipc-message-reply",
    process: "worker"
  };
  (self as DedicatedWorkerGlobalScope).postMessage(replyMessage);
}

function responseError<Args extends any[], S extends Plugin.State = any>(
  message: Plugin.Message<Args>,
  error: any,
  state: S
) {
  const errorMessage: Plugin.MessageReply<Args, any> = {
    ...message,
    payload: { error, state },
    type: "ipc-message-reply-error",
    process: "worker"
  };
  (self as DedicatedWorkerGlobalScope).postMessage(errorMessage);
}

interface ReplyHandlersValue {
  readonly resolve: (value?: any) => void;
  readonly reject: (reason?: any) => void;
}
