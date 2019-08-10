import { listen, send, $el, $content } from "@overpaper/plugin";

listen(async (req, res) => {
  switch (req.context.type) {
    case "query": {
      if (req.context.query.trim().length === 0) {
        return res.reply({
          content: $content.inline([$el.text({ text: "Enter city " })])
        });
      }
      const { payload: apikey } = await send("storage-get", "apikey");
      if (!apikey) {
        return res.reply({ content: auth() });
      }
      return res.reply(await getWeather(req.context.query, apikey));
    }
    case "form": {
      const { apikey } = req.context.body;
      if (!apikey) {
        await send("storage-remove", "apikey");
        return res.error({ error: "Need API Key" });
      }
      await send("storage-set", "apikey", apikey);
      return res.reply(await getWeather(req.context.query, apikey));
    }
    default:
      break;
  }
});

const getWeather = async (query: string, apikey: string) => {
  const [city, country] = query.split(",");
  const apiurl = "https://api.openweathermap.org/data/2.5";
  let q = `${city}`;
  if (country) {
    q += `,${country}`;
  }
  const url = `${apiurl}/weather?q=${q}&units=metric&APPID=${apikey}`;
  return (await fetch(url)
    .then(async response => {
      switch (response.status) {
        case 401: {
          await send("storage-remove", "apikey");
          return auth();
        }
        case 404: {
          return $content.inline([$el.text({ text: "Not found" })]);
        }
        case 200: {
          const json = await response.json();
          return $content.inline([
            $el.text({ text: `${Math.round(json.main.temp)}°C` })
          ]);
        }
        default: {
          console.warn(response);
          return $content.inline([$el.text({ text: "Something went wrong" })]);
        }
      }
    })
    .catch(error => {
      console.error(error);
      return $content.inline([$el.text({ text: "Something went wrong" })]);
    })) as any;
};

const auth = () => {
  return $content.inline([
    $el.form({
      body: [
        $el.input({ type: "text", name: "apikey", placeholder: "API Key" })
      ]
    })
  ]);
};
