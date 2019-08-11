export const $link = (props: {
  text: string | number;
  url: string;
}): { type: "link"; text: string | number; url: string } => ({
  type: "link",
  ...props
});
