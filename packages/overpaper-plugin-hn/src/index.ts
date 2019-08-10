import { listen, $content, $el } from "@overpaper/plugin";

listen(async (req, res) => {
  switch (req.context.type) {
    case "query": {
      const idx = req.context.state ? req.context.state.idx : 0;
      const ids = await (await fetch(
        "https://hacker-news.firebaseio.com/v0/topstories.json"
      )).json();
      const post = await (await fetch(
        `https://hacker-news.firebaseio.com/v0/item/${ids[idx]}.json`
      )).json();
      return res.reply({
        content: $content.inline([
          $el.button({ label: "<-", action: "" }),
          $el.button({ label: "->", action: "" }),
          $el.text({ text: " " }),
          $el.link({ text: post.title, url: post.url })
        ]),
        state: { idx: idx + 1 }
      });
    }
    default:
      break;
  }
});
