import * as A from "./A.ts";
import * as B from "./B.ts";

const encrypted = A.send();
B.receive(encrypted);
