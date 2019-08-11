export const $text = (props: {
  text: string | number;
}): { type: "text"; text: string | number } => ({
  type: "text",
  ...props
});
