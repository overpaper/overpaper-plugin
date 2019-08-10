import { listen, $el, $content } from "@overpaper/plugin";

listen(async (req, res) => {
  switch (req.context.type) {
    case "query": {
      if (req.context.query.trim().length === 0) {
        return res.reply({
          content: $content.inline([$el.text({ text: "Enter currency" })])
        });
      }
      const json = await (await fetch(
        `https://api.cryptonator.com/api/ticker/${req.context.query}-usd`
      )).json();
      return res.reply({
        content: $content.inline([
          $el.text({ text: `$${Math.round(json.ticker.price * 100) / 100}` })
        ])
      });
    }
    default:
      break;
  }
});
