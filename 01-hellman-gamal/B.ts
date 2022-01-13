import { G, g } from "./run.ts";
import { exp } from "../../rsa.ts";
import { flow, map } from "../../fp.ts";
import {
    Bit,
    chunkBy,
    dechunkBy,
    flatten,
    fromCharCode,
    join,
    log,
    toBigInt,
    toBitArray,
    toCharCodes,
} from "../../lib.ts";
import { decrypt } from "../../elgamal.ts";

const secret = 590827n;
let key: bigint;

console.log("##############################");
console.log("# B: ", secret);
console.log("##############################");

export function sharedKey() {
    return exp(g, secret, G);
}

export function receiveSharedKey(otherKey: bigint) {
    console.log("B: received:", otherKey);
    key = exp(otherKey, secret, G);
    console.log("B: Shared Key is:", key);
}

export function receiveMessage(message: Bit[]) {
    const maxEncryptedLength = G.toString(2).length;
    const maxEncryptLength = maxEncryptedLength - 1;
    console.log("----- B -----");
    const resolved = flow(
        chunkBy(maxEncryptedLength),
        map(
            toBigInt(),
            (value: bigint) => decrypt(value, key, G),
            toBitArray(maxEncryptLength),
        ),
        flatten<Bit[]>(),
        dechunkBy(8),
        map(toBigInt(), fromCharCode()),
        join(""),
    )(message);

    console.log("==> Resolved:", resolved);
}
