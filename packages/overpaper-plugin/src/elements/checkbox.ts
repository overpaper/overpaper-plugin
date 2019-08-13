export const $checkbox = (props: {
  label?: string | number;
  action: string | number | { [key: string]: any };
  checked: boolean;
}): {
  type: "checkbox";
  label?: string | number;
  action: string | number | { [key: string]: any };
  checked: boolean;
} => ({ type: "checkbox", ...props });
