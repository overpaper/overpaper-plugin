export const $checkbox = (props: {
  label?: string | number;
  action: { [key: string]: any };
  checked: boolean;
}): {
  type: "checkbox";
  label?: string | number;
  action: { [key: string]: any };
  checked: boolean;
} => ({ type: "checkbox", ...props });
