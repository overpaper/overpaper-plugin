import { listen, $el, $body } from "@overpaper/plugin";

var eval2 = eval;

listen(async (req, res) => {
  switch (req.context.type) {
    case "query": {
      return res.reply({ body: evaluate(req.context.query), state: {} });
    }
    default:
      break;
  }
});

const evaluate = (expression: string) => {
  return $body.inline({
    content: [$el.text({ text: `= ${eval2(expression)}` })]
  });
};
