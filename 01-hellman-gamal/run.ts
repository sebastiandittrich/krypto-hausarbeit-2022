import * as A from "./A.ts";
import * as B from "./B.ts";

export const g = 159n;
export const G = 153351365473n;

console.log("----- System -----");
console.log("g:", g);
console.log("G:", G);

console.log("----- Key exchange -----");
B.receiveSharedKey(A.sharedKey());
A.receiveSharedKey(B.sharedKey());

B.receiveMessage(A.sendMessage());
