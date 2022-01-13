import { G, g } from "./run.ts";
import { Bit, chunkBy, exp, flatten, join, log, toBigInt, toBitArray, toCharCodes } from "../lib/lib.ts";
import { flow, leaf, map } from "../lib/fp.ts";
import { encrypt } from "../lib/elgamal.ts";

const secret = 92745n;
let key: bigint;

console.log("##############################");
console.log("# A: ", secret);
console.log("##############################");

export function sharedKey() {
    return exp(g, secret, G);
}

export function receiveSharedKey(otherKey: bigint) {
    console.log("A: received:", otherKey);
    key = exp(otherKey, secret, G);
    console.log("A: Shared Key is:", key);
}

export function sendMessage() {
    const maxEncryptedLength = G.toString(2).length;
    const maxEncryptLength = maxEncryptedLength - 1;
    console.log("----- A -----");
    return flow(
        toCharCodes(),
        map(toBitArray(8)),
        leaf(map(join<Bit>("")), log<string[]>("Encoded string")),
        flatten<Bit[]>(),
        chunkBy(maxEncryptLength),
        leaf(map(join<Bit>("")), log<string[]>("chunked data")),
        map(toBigInt(), (value: bigint) => encrypt(value, key, G), toBitArray(maxEncryptedLength)),
        leaf(map(join<Bit>("")), log<string[]>("encrypted chunked data")),
        flatten<Bit[]>(),
    )("Bitcoins");
}
