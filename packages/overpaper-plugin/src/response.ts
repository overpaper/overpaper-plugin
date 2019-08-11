import { $el } from "./elements";
import { Message, MessageReply } from ".";

export function reply<Args extends any[]>(
  message: Message<Args>,
  body: ResponseBody,
  state?: any
) {
  const replyMessage: MessageReply<
    Args,
    { body: ResponseBody; state?: any }
  > = {
    ...message,
    payload: { body, state },
    type: "ipc-message-reply",
    process: "worker"
  };
  (self as DedicatedWorkerGlobalScope).postMessage(replyMessage);
}

export function error<Args extends any[]>(
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

export interface Response {
  readonly reply: (args: { body: ResponseBody; state?: any }) => void;
  readonly error: (args: { error: any; state?: any }) => void;
}

export type ResponseBody = ResponseBodyInline;

export interface ResponseBodyInline {
  readonly type: "inline";
  readonly content: ResponsePayloadInlineContent;
}

export type ResponsePayloadInlineContent = ResponsePayloadInlineContentItem[];

export type ResponsePayloadInlineContentItem = ReturnType<
  typeof $el[keyof typeof $el]
>;
