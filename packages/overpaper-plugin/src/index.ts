import nanoid from "nanoid/non-secure";
import { Request } from "./request";
import { error, reply, Response, ReplyPayload } from "./response";
import { Message, MessageReply, ReplyHandlersValue, State } from "./types";

export * from "./elements";
export * from "./request";
export * from "./response";
export * from "./types";

const replyHandlers = new Map<string, ReplyHandlersValue>();

export function listen<S extends State = any>(
  callback: (request: Request<S>, response: Response<S>) => Promise<void>
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
          reply: ({ body, state }) => reply(message, body, state),
          error: ({ error, state }) => error(message, error, state)
        };
        callback(request, response).catch(err =>
          error(message, err.toString(), request.context.state)
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

export function push<Args extends any[], Payload>(
  key: string,
  payload: ReplyPayload
) {
  return send("push", key, payload);
}
