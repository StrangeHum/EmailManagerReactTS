import Imap from "imap";
import LibParser from "mailparser";
import config from "src/shConfigEmail.js";

const simpleParser = LibParser.simpleParser;
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

imap.once("ready", function () {
  openInbox(function (err, box) {
    console.log("open");
    if (err) throw err;
  });
});

imap.connect();

const CloseImap = () => {
  imap.end();
};
const GetMessage = async () => {
  //TODO: Проверка на сосотояние, если в этом есть необходимость
  var f = imap.seq.fetch("30", {
    bodies: "",
    struct: true,
  });
  f.on("message", function (msg, seqno) {
    msg.on("body", function (stream, info) {
      simpleParser(stream, (err, mail) => {
        return mail.date;
      });
    });
  });
};

export { GetMessage, CloseImap };
