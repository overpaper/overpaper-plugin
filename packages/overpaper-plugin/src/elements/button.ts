export const $button = (props: {
  label?: string | number;
  action: { [key: string]: any };
  icon?: string;
}): {
  type: "button";
  label?: string | number;
  action: { [key: string]: any };
  icon?: string;
} => ({ type: "button", ...props });
