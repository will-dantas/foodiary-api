import { CustomMessageTriggerEvent } from "aws-lambda";
import { render } from "@react-email/render";
import ForgotPassword from "@infra/emails/templates/ForgotPassword";

export async function handler(event: CustomMessageTriggerEvent) {
  if (event.triggerSource === 'CustomMessage_ForgotPassword') {
    const code = event.request.codeParameter;

    const html = await render(ForgotPassword({confirmationCode: code}));;

    event.response.emailSubject = `🍎 Foodiary | Recupere sua conta!`;
    event.response.emailMessage = html;
  }

  return event;
}