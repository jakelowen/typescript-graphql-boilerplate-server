// import "jest";
import * as Mailgun from "mailgun-js";
import { messageDataType } from "../types/messageData";

const productionSendEmail = (messageData: messageDataType) => {
  const mailgun = new Mailgun({
    apiKey: process.env.MAILGUN_API_KEY as string,
    domain: process.env.MAILGUN_DOMAIN as string
  });

  console.log("!!! real sendEmail was called");

  return mailgun.messages().send(messageData);
};

const mockSendEmail = ({}): {
  message: string;
  id: string;
} => {
  console.log("!!! mocked sendEmail was called");
  return {
    message: "mock sent",
    id: "mock sent id"
  };
};

export default async (messageData: messageDataType) => {
  return process.env.NODE_ENV === "test"
    ? mockSendEmail(messageData)
    : productionSendEmail(messageData);
};
