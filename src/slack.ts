import type { Handler } from "@netlify/functions";

import { parse } from "querystring";
import { slackApi } from "./util/slack";

async function handleSlackSlashCommand(payload: SlackSlashCommandPayload) {
  switch (payload.command) {
    case "/taskfight":
      const joke = await fetch("https://icanhazdadjoke.com", {
        headers: { accept: "text/plain" },
      });
      const response = await slackApi("chat.postMessage", {
        channel: payload.channel_id,
        // text: "Things are happening!",
        text: await joke.text(),
      });

      if (!response.ok) {
        console.log(response);
      }

      break;

    default:
      return {
        statusCode: 200,
        body: `command ${payload.command} is not recognised`,
      };
  }

  return {
    statusCode: 200,
    body: "",
  };
}

export const handler: Handler = async (event) => {
  // TODO: validate the slack request

  // TODO: handle the slash commands
  const body = parse(event.body ?? "") as SlackPayload;
  if (body.command) {
    return handleSlackSlashCommand(body as SlackSlashCommandPayload);
  }

  // TODO: handle interactivity (e.g - context commands, modals)

  return {
    statusCode: 200,
    body: "TODO: handle slack commands and interactivity",
  };
};
