import { listen, $el, $body } from "@overpaper/plugin";

listen(async (req, res) => {
  switch (req.context.type) {
    case "query": {
      if (req.context.query.trim().length === 0) {
        return res.reply({
          body: $body.inline({
            content: [$el.text({ text: "Enter currency" })]
          }),
          state: {}
        });
      }
      const json = await (await fetch(
        `https://api.cryptonator.com/api/ticker/${req.context.query}-usd`
      )).json();
      return res.reply({
        body: $body.inline({
          content: [
            $el.text({ text: `$${Math.round(json.ticker.price * 100) / 100}` })
          ]
        }),
        state: {}
      });
    }
    default:
      break;
  }
});
