import Imap from "imap";
import LibParser from "mailparser";
import fs from "fs";
import { inspect } from "util";
import config from "./connect";

const MailParser = LibParser.MailParser;
var imap = new Imap({
  user: config.user,
  password: config.password,
  host: config.host,
  port: 993,
  tls: true,
  tlsOptions: {
    rejectUnauthorized: false,
  },
});
function openInbox(cb) {
  imap.openBox("INBOX", true, cb);
}
var messages = [];

imap.once("ready", function () {
  openInbox(function (err, box) {
    console.log("open");
    if (err) throw err;

    var f = imap.seq.fetch("30", {
      bodies: "HEADER.FIELDS (FROM TO SUBJECT DATE)",
      struct: true,
    });
    f.on("message", function (msg, seqno) {
      console.log("Message #%d", seqno);
      var prefix = "(#" + seqno + ") ";
      msg.on("body", function (stream, info) {
        var buffer = "";
        stream.on("data", function (chunk) {
          buffer += chunk.toString("utf8");
        });
        stream.once("end", function () {
          console.log(
            prefix + "Parsed header: %s",
            inspect(Imap.parseHeader(buffer))
          );
        });
      });
      msg.once("attributes", function (attrs) {
        console.log(prefix + "Attributes: %s", inspect(attrs, false, 8));
      });
      msg.once("end", function () {
        console.log(prefix + "Finished");
      });
    });
    f.once("error", function (err) {
      console.log("Fetch error: " + err);
    });
    f.once("end", function () {
      console.log("Done fetching all messages!");
      imap.end();
    });
  });
});
imap.once("error", function (err) {
  console.log(err);
});
imap.once("end", function () {
  console.log("Connection ended");
});
imap.connect();
