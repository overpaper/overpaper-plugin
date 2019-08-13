import { listen, $el, $body, push } from "@overpaper/plugin";

const intervals: { [key: string]: number } = {};

listen(async (req, res) => {
  switch (req.context.type) {
    case "query": {
      const time = req.context.query.split(":");

      let mm = parseInt(time[0]);
      let ss = parseInt(time[1]);

      if (isNaN(mm) || isNaN(ss)) {
        return res.reply({
          body: $body.inline({
            content: [$el.text({ text: "Format is mm:ss" })]
          }),
          state: {}
        });
      } else if (ss < 0 || mm < 0) {
        return res.reply({
          body: $body.inline({
            content: [$el.text({ text: "Impossible time" })]
          }),
          state: {}
        });
      }

      const tick = () => {
        ss -= 1;
        if (ss < 0) {
          mm -= 1;
          if (mm < 0) {
            mm = 0;
            ss = 0;
            return false;
          }
          ss = 59;
        }
        return true;
      };

      intervals[req.context.key] = setInterval(() => {
        tick();
        if (mm > 0 || ss > 0) {
          push(req.context.key, step(mm, ss));
        } else {
          push(req.context.key, finish());
          cleanup(req.context.key);
        }
      }, 1000);

      return res.reply(step(mm, ss));
    }
    case "cleanup": {
      cleanup(req.context.key);
      break;
    }
    default:
      break;
  }
});

const step = (mm: number, ss: number) => {
  const MM = mm < 10 ? `0${mm}` : `${mm}`;
  const SS = ss < 10 ? `0${ss}` : `${ss}`;
  return {
    body: $body.inline({
      content: [$el.text({ text: `Time left: ${MM}:${SS}` })]
    }),
    state: {}
  };
};

const finish = () => {
  return {
    body: $body.inline({
      content: [$el.text({ text: "Bzzzzzz" }), $el.icon({ icon: "bell" })]
    }),
    state: {}
  };
};

const cleanup = (key: string) => {
  clearInterval(intervals[key]);
  delete intervals[key];
};
