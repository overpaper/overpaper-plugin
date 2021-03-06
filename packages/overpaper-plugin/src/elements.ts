import { $bodyInline } from "./elements/body";
import { $button } from "./elements/button";
import { $form } from "./elements/form";
import { $icon } from "./elements/icon";
import { $input } from "./elements/input";
import { $link } from "./elements/link";
import { $oauth } from "./elements/oauth";
import { $text } from "./elements/text";
import { $checkbox } from "./elements/checkbox";

export const $el = {
  text: $text,
  link: $link,
  icon: $icon,
  button: $button,
  checkbox: $checkbox,
  input: $input,
  form: $form,
  oauth: $oauth
};

export const $body = {
  inline: $bodyInline
};
