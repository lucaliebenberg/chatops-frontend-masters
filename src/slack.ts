import type { Handler } from "@netlify/functions";

import { parse } from "querystring";
import { blocks, modal, slackApi, verifySlackRequest } from "./util/slack";

async function handleSlackSlashCommand(payload: SlackSlashCommandPayload) {
  switch (payload.command) {
    case "/taskfight":
      const response = await slackApi(
        "views.open",
        modal({
          id: "taskfight-modal",
          title: "Name the upcoming tasks",
          trigger_id: payload.trigger_id,
          blocks: [
            blocks.section({
              text: "The discourse requires you to fill up the backlog for the unlucky developers *Start defining tasks in the teams backlog*",
            }),
            blocks.input({
              id: "opinion",
              label: "Define tasks in the teams backlog",
              placeholder:
                "Define tasks in the teams backlog, and cause tension!",
              initial_value: payload.text ?? "",
              hint: "What tasks do you think should be added to the backlog? State them with no fear",
            }),
            blocks.select({
              id: "task level",
              label: "How important is the task?",
              placeholder: "Select a task level",
              options: [
                { label: "low", value: "low" },
                { label: "medium", value: "medium" },
                { label: "high", value: "high" },
              ],
            }),
          ],
        })
      );
      //   const joke = await fetch("https://icanhazdadjoke.com", {
      //     headers: { accept: "text/plain" },
      //   });
      //   const response = await slackApi("chat.postMessage", {
      //     channel: payload.channel_id,
      //     // text: "Things are happening!",
      //     text: await joke.text(),
      //   });

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

// C05RQQS167N
async function handleInteractivity(payload: SlackModalPayload) {
  const callback_id = payload.callback_id ?? payload.view.callback_id;

  switch (callback_id) {
    case "taskfight-modal":
      const data = payload.view.state.values;
      const fields = {
        opinion: data.opinion_block.opinion.value,
        taskLevel: data.spice_level_block.spice_level.selected_option.value,
        submitter: payload.user.name,
      };

      await slackApi("chat.postMessage", {
        channel: "C05RQQS167N",
        text: `Oh dang ya'll! :eyes <a${payload.user.id}> just posted a task with a ${fields.taskLevel}`,
      });

      break;

    default:
      console.log(`No handler specified for ${callback_id}`);
      return {
        statusCode: 400,
        body: `No handler specified for ${callback_id}`,
      };
  }
  return {
    statusCode: 200,
    body: "",
  };
}

export const handler: Handler = async (event) => {
  // TODO: validate the slack request
  const valid = verifySlackRequest(event);

  if (!valid) {
    console.error("Invalid request");

    return {
      statusCode: 400,
      body: "invalid request",
    };
  }

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
