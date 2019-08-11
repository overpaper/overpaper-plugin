export const $icon = (props: {
  icon: string;
}): { type: "icon"; icon: string } => ({
  type: "icon",
  ...props
});
