import { Plugin } from "../types";

export const $bodyInline = ({
  content
}: {
  content: Plugin.Response.BodyInlineContent;
}): { type: "inline"; content: Plugin.Response.BodyInlineContent } => ({
  type: "inline",
  content
});
