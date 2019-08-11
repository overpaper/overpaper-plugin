export const $input = ({
  type,
  ...props
}: {
  type: "text" | "number" | "hidden";
  name: string;
  value?: string;
  placeholder?: string;
}): {
  type: "input";
  input: "text" | "number" | "hidden";
  name: string;
  value?: string;
  placeholder?: string;
} => ({
  type: "input",
  input: type,
  ...props
});
