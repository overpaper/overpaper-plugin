import { listen, $body, $el } from "@overpaper/plugin";

listen(async (req, res) => {
  switch (req.context.type) {
    case "query": {
      return res.reply({ body: await query(0), state: {} });
    }
    case "action": {
      const { action } = req.context;
      return res.reply({ body: await query(action.idx), state: {} });
    }
    default:
      break;
  }
});

const query = async (idx: number) => {
  const post = await fetchPost(idx);

  if (!post) {
    return $body.inline({
      content: [
        $el.button({ label: "Refresh", action: { idx: 0 } }),
        $el.text({ text: " " }),
        $el.text({ text: "Nothing found" })
      ]
    });
  }

  const text = post.body.title ? post.body.title : post.body.text;

  const controls = [
    $el.button({ label: "<-", action: { idx: post.prevIdx } }),
    $el.button({ label: "->", action: { idx: post.nextIdx } }),
    $el.text({ text: " " })
  ];

  if (!text) {
    return $body.inline({
      content: [
        ...controls,
        $el.text({ text: "Nothing to show for this post" })
      ]
    });
  }

  return $body.inline({
    content: [
      ...controls,
      post.body.url
        ? $el.link({ text, url: post.body.url })
        : $el.text({ text })
    ]
  });
};

const fetchPost = async (
  idx: number
): Promise<{
  nextIdx: number;
  prevIdx: number;
  body: { text?: string; title?: string; url?: string };
} | null> => {
  const ids = await fetch(
    "https://hacker-news.firebaseio.com/v0/topstories.json"
  ).then(r => r.json());

  const post = await fetch(
    `https://hacker-news.firebaseio.com/v0/item/${ids[idx]}.json`
  ).then(r => r.json());

  if (!post) {
    return null;
  }

  return {
    nextIdx: idx + 1 < ids.length ? idx + 1 : 0,
    prevIdx: idx - 1 >= 0 ? idx - 1 : ids.length - 1,
    body: post
  };
};
