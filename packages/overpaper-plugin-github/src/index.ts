import { $body, $el, listen, push, Plugin, send } from "@overpaper/plugin";

listen(async (req, res) => {
  const { payload: oauth } = await send("oauth:get", "github", "repo");
  if (!oauth) {
    return res.reply({
      body: $body.inline({
        content: [$el.oauth({ provider: "github", scope: "repo" })]
      }),
      state: {}
    });
  }

  switch (req.context.type) {
    case "query": {
      const [cmd, params] = req.context.query.split(":");
      switch (cmd) {
        case "issue": {
          return res.reply(
            await getIssue({
              params,
              token: oauth.access_token
            })
          );
        }
        default:
          break;
      }
      return res.reply({
        body: $body.inline({
          content: [$el.text({ text: "Nothing to show" })]
        }),
        state: {}
      });
    }
    case "action": {
      switch (req.context.action.cmd) {
        case "close-issue":
        case "open-issue": {
          return res.reply(
            await patchIssue({
              context: req.context,
              token: oauth.access_token,
              body: {
                state:
                  req.context.action.cmd === "close-issue" ? "closed" : "open"
              }
            })
          );
        }
        default: {
          return res.reply({
            body: $body.inline({
              content: [$el.text({ text: "Action not supported" })]
            }),
            state: {}
          });
        }
      }
    }
    default:
      break;
  }
});

const getIssue = async ({
  params,
  token
}: {
  params: string;
  token: string;
}) => {
  const [repo, num] = params.split("#");
  const result = await fetcher({
    url: `/repos/${repo}/issues/${num}`,
    token: token
  });
  if (!result.ok) {
    return {
      body: $body.inline({
        content: [$el.text({ text: result.message })]
      }),
      state: {}
    };
  }
  return {
    body: $body.inline({
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
    }),
    state: {
      text: result.json.title,
      url: result.json.html_url,
      state: result.json.state
    }
  };
};

const patchIssue = async ({
  context,
  token,
  body
}: {
  context: Plugin.Request.ContexAction;
  token: string;
  body: { state: "closed" | "open" };
}) => {
  const $$checkbox = (issueState: "closed" | "open") => {
    return $el.checkbox({
      checked: issueState === "closed",
      action: {
        ...context.action,
        cmd: issueState === "closed" ? "open-issue" : "close-issue"
      }
    });
  };

  push(context.key, {
    body: $body.inline({
      content: [
        $$checkbox(body.state),
        $el.link({ text: context.state.text, url: context.state.url })
      ]
    }),
    state: context.state
  });

  const result = await fetcher({
    url: `/repos/${context.action.repo}/issues/${context.action.num}`,
    token: token,
    opts: { method: "PATCH", body: JSON.stringify(body) }
  });

  if (!result.ok) {
    return {
      body: $body.inline({ content: [$el.text({ text: result.message })] }),
      state: {}
    };
  }

  return {
    body: $body.inline({
      content: [
        $$checkbox(result.json.state),
        $el.link({ text: result.json.title, url: result.json.html_url })
      ]
    }),
    state: {
      text: result.json.title,
      url: result.json.html_url,
      state: result.json.state
    }
  };
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
      try {
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
      } catch (error) {
        return {
          ok: false,
          status: 500,
          message: error.toString()
        };
      }
    })
    .catch(error => ({
      ok: false,
      status: 500,
      message: error.toString()
    })) as any;
};
