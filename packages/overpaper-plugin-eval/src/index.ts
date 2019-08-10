import { listen, $el, $content } from "@overpaper/plugin";

listen(async (req, res) => {
  switch (req.context.type) {
    case "query": {
      return res.reply({ content: evaluate(req.context.query) });
    }
    default:
      break;
  }
});

const evaluate = (expression: string) => {
  return $content.inline([$el.text({ text: `= ${eval(expression)}` })]);
};
