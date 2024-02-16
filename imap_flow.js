import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import config from "./connect";

const client = new ImapFlow({
  host: config.host,
  port: 993,
  secure: true,
  logger: false,
  auth: {
    user: config.user,
    pass: config.password,
  },
});

const main = async () => {
  await client.connect();
  let lock = await client.getMailboxLock("INBOX");
  try {
    let message = await client.fetchOne(client.mailbox.exists, {
      source: true,
    });
    console.log(message.source.toString());
    simpleParser(message.source);
  } finally {
    lock.release();
  }

  // log out and close connection
  await client.logout();
};

main().catch((err) => console.error(err));
