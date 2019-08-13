import { $el } from "./elements";
import { Message, MessageReply, State } from "./";

export function reply<Args extends any[], S extends State = any>(
  message: Message<Args>,
  body: ResponseBody,
  state: S
) {
  const replyMessage: MessageReply<Args, ReplyPayload<S>> = {
    ...message,
    payload: { body, state },
    type: "ipc-message-reply",
    process: "worker"
  };
  (self as DedicatedWorkerGlobalScope).postMessage(replyMessage);
}

export function error<Args extends any[], S extends State = any>(
  message: Message<Args>,
  error: any,
  state: S
) {
  const errorMessage: MessageReply<Args, any> = {
    ...message,
    payload: { error, state },
    type: "ipc-message-reply-error",
    process: "worker"
  };
  (self as DedicatedWorkerGlobalScope).postMessage(errorMessage);
}

export interface Response<S extends State = any> {
  readonly reply: (args: { body: ResponseBody; state: S }) => void;
  readonly error: (args: { error: any; state: S }) => void;
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

export interface ReplyPayload<S extends State = any> {
  readonly body: ResponseBody;
  readonly state: S;
}
