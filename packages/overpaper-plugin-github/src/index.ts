import { listen, $el, $body, send } from "@overpaper/plugin";

listen(async (req, res) => {
  switch (req.context.type) {
    case "query": {
      const { payload: oauth } = await send("oauth:get", "github");

      if (!oauth) {
        return res.reply({
          body: $body.inline([$el.oauth({ provider: "github" })])
        });
      }

      const data = await fetch(
        `https://api.github.com/repos/${req.context.query}?access_token=${oauth.access_token}`
      ).then(r => r.json());

      if (data.message === "Not found") {
        return res.reply({
          body: $body.inline([$el.text({ text: "Not found" })])
        });
      }

      return res.reply({
        body: $body.inline([$el.link({ text: data.title, url: data.html_url })])
      });
    }
    default:
      break;
  }
});
