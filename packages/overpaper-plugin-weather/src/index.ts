import { listen, send, ResponsePayload } from "@overpaper/plugin";

listen(async (req, res) => {
  switch (req.params.type) {
    case "query": {
      if (req.params.query.trim().length === 0) {
        return res.reply({
          type: "inline",
          content: [{ type: "text", text: "Enter city" }]
        });
      }
      const { payload: apikey } = await send("storage-get", "apikey");
      if (!apikey) {
        return res.reply(auth());
      }
      return res.reply(await getWeather(req.params.query, apikey));
    }
    case "form": {
      const { apikey } = req.params.body;
      if (!apikey) {
        await send("storage-remove", "apikey");
        return res.error("Need API Key");
      }
      await send("storage-set", "apikey", apikey);
      return res.reply(await getWeather(req.params.query, apikey));
    }
    default:
      break;
  }
});

const getWeather = async (
  query: string,
  apikey: string
): Promise<ResponsePayload> => {
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
          return {
            type: "inline",
            content: [{ type: "text", text: "Not found" }]
          };
        }
        case 200: {
          const json = await response.json();
          return {
            type: "inline",
            content: [{ type: "text", text: `${Math.round(json.main.temp)}°C` }]
          };
        }
        default: {
          console.warn(response);
          return {
            type: "inline",
            content: [{ type: "text", text: "Something went wrong" }]
          };
        }
      }
    })
    .catch(error => {
      console.error(error);
      return {
        type: "inline",
        content: [{ type: "text", text: "Something went wrong" }]
      };
    })) as any;
};

const auth = (): ResponsePayload => {
  return {
    type: "inline",
    content: [
      {
        type: "form",
        body: [
          {
            type: "input",
            input: "text",
            name: "apikey",
            placeholder: "API Key"
          }
        ]
      }
    ]
  };
};
