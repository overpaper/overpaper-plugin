import { listen } from "@overpaper/plugin";

listen(async (req, res) => {
  switch (req.params.type) {
    case "query": {
      if (req.params.query.trim().length === 0) {
        return res.reply({
          type: "inline",
          content: [
            {
              type: "text",
              text: `Enter currency`
            }
          ]
        });
      }
      const json = await (await fetch(
        `https://api.cryptonator.com/api/ticker/${req.params.query}-usd`
      )).json();
      return res.reply({
        type: "inline",
        content: [
          {
            type: "text",
            text: `$${Math.round(json.ticker.price * 100) / 100}`
          }
        ]
      });
    }

    default:
      break;
  }
});
