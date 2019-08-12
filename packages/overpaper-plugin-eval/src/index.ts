import { listen, $el, $body } from "@overpaper/plugin";

listen(async (req, res) => {
  switch (req.context.type) {
    case "query": {
      return res.reply({ body: evaluate(req.context.query) });
    }
    default:
      break;
  }
});

const evaluate = (expression: string) => {
  return $body.inline({
    content: [$el.text({ text: `= ${eval(expression)}` })]
  });
};
