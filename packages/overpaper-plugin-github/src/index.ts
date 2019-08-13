import { listen, $el, $body, send } from "@overpaper/plugin";

listen(async (req, res) => {
  const { payload: oauth } = await send("oauth:get", "github", "repo");
  if (!oauth) {
    return res.reply({
      body: $body.inline({
        content: [$el.oauth({ provider: "github", scope: "repo" })]
      })
    });
  }

  switch (req.context.type) {
    case "query": {
      const [cmd, params] = req.context.query.split(":");
      switch (cmd) {
        case "issue": {
          const [repo, num] = params.split("#");
          const issue = await getIssue({
            repo,
            num,
            token: oauth.access_token
          });
          return res.reply({ body: issue });
        }
        default:
          break;
      }
      return res.reply({
        body: $body.inline({
          content: [$el.text({ text: "Nothing to show" })]
        })
      });
    }
    case "action": {
      const { action } = req.context;
      if (typeof action !== "object") {
        return res.error({ error: "Wrong request" });
      }
      switch (action.cmd) {
        case "close-issue":
        case "open-issue": {
          return res.reply({
            body: await patchIssue({
              repo: action.repo,
              num: action.num,
              token: oauth.access_token,
              body: {
                state: action.cmd === "close-issue" ? "closed" : "open"
              }
            })
          });
        }
        default: {
          return res.reply({
            body: $body.inline({
              content: [$el.text({ text: "Action not supported" })]
            })
          });
        }
      }
    }
    default:
      break;
  }
});

const getIssue = async ({
  repo,
  num,
  token
}: {
  repo: string;
  num: string;
  token: string;
}) => {
  const result = await fetcher({
    url: `/repos/${repo}/issues/${num}`,
    token: token
  });
  if (!result.ok) {
    return $body.inline({
      content: [$el.text({ text: result.message })]
    });
  }
  return $body.inline({
    content: [
      $el.checkbox({
        checked: result.json.state === "closed",
        action: {
          cmd: result.json.state === "closed" ? "open-issue" : "close-issue",
          repo,
          num
        }
      }),
      $el.link({ text: result.json.title, url: result.json.html_url })
    ]
  });
};

const patchIssue = async ({
  repo,
  num,
  token,
  body
}: {
  repo: string;
  num: string;
  token: string;
  body: any;
}) => {
  const result = await fetcher({
    url: `/repos/${repo}/issues/${num}`,
    token: token,
    opts: {
      method: "PATCH",
      body: JSON.stringify(body)
    }
  });
  if (!result.ok) {
    return $body.inline({
      content: [$el.text({ text: result.message })]
    });
  }
  return $body.inline({
    content: [
      $el.checkbox({
        checked: result.json.state === "closed",
        action: {
          cmd: result.json.state === "closed" ? "open-issue" : "close-issue",
          repo,
          num
        }
      }),
      $el.link({ text: result.json.title, url: result.json.html_url })
    ]
  });
};

const fetcher = ({
  url,
  token,
  opts = {}
}: {
  url: string;
  token: string;
  opts?: RequestInit;
}): Promise<
  | { ok: true; status: number; json: any }
  | { ok: false; status: number; message: string }
> => {
  return fetch(`https://api.github.com${url}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...opts.headers
    }
  })
    .then(async response => {
      const json = await response.json();
      if (response.ok) {
        return {
          ok: true,
          status: response.status,
          json
        };
      } else {
        return {
          ok: false,
          status: response.status,
          message: json.message
        };
      }
    })
    .catch(error => ({
      ok: false,
      status: 500,
      message: error.toString()
    })) as any;
};
