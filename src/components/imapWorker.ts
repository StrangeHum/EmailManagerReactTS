import { GetMessage, start, CloseImap } from "./imapPovider";

// imap.connect();

onmessage = (e) => {
  start();
  CloseImap();
  self.postMessage(e.data);
};
