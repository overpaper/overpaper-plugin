import { ResponsePayloadInlineContent } from "../response";

export const $bodyInline = (
  content: ResponsePayloadInlineContent
): { type: "inline"; content: ResponsePayloadInlineContent } => ({
  type: "inline",
  content
});
