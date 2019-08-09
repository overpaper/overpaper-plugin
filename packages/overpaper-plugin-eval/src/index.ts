import { listen, ResponsePayload } from "@overpaper/plugin";

listen(async (req, res) => {
  switch (req.params.type) {
    case "query": {
      return res.reply(evaluate(req.params.query));
    }
    default:
      break;
  }
});

const evaluate = (expression: string): ResponsePayload => {
  return {
    type: "inline",
    content: [
      {
        type: "text",
        text: `= ${eval(expression)}`
      }
    ]
  };
};
