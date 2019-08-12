import { listen, $el, $body, send } from "@overpaper/plugin";

listen(async (req, res) => {
  switch (req.context.type) {
    case "query": {
      const { payload: oauth } = await send("oauth:get", "github");

      if (!oauth) {
        return res.reply({
          body: $body.inline({
            content: [$el.oauth({ provider: "github", scope: "" })]
          })
        });
      }

      console.log(oauth);
      const data = await fetch(
        `https://api.github.com/repos/${req.context.query}?access_token=${oauth.access_token}`
      ).then(r => r.json());

      console.log(data);

      if (data.message === "Not found") {
        return res.reply({
          body: $body.inline({
            content: [$el.text({ text: "Not found" })]
          })
        });
      }

      return res.reply({
        body: $body.inline({
          content: [$el.link({ text: data.title, url: data.html_url })]
        })
      });
    }
    default:
      break;
  }
});
