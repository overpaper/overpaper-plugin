import { $input } from "./input";

export const $form = (props: {
  body: ReturnType<typeof $input>[];
}): {
  type: "form";
  body: ReturnType<typeof $input>[];
} => ({ type: "form", ...props });
