import * as SparkPost from "sparkpost";

const client = new SparkPost(process.env.SPARKPOST_API_KEY);

export const sendEmail = async (recipient: string, url: string) => {
  const response = await client.transmissions.send({
    content: {
      from: "test@jakelowen.com",
      subject: "Confirm Email",
      html: `<html>
        <body>
          <p><a href="${url}">Confirm Email</a> </p>
        </body>
      </html>`
    },
    recipients: [{ address: recipient }]
  });
  console.log(response);
};
