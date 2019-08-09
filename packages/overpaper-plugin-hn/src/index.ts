import { listen } from "@overpaper/plugin";

listen(async (req, res) => {
  switch (req.params.type) {
    case "query": {
      const ids = await (await fetch(
        "https://hacker-news.firebaseio.com/v0/topstories.json"
      )).json();
      const post = await (await fetch(
        `https://hacker-news.firebaseio.com/v0/item/${ids[0]}.json`
      )).json();
      return res.reply({
        type: "inline",
        content: [
          {
            type: "link",
            text: post.title,
            url: post.url
          }
        ]
      });
    }

    default:
      break;
  }
});
