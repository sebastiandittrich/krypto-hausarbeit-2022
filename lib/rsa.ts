import { randomBigIntRange } from "https://deno.land/x/random_bigint/mod.ts";
import { exp, ggt, inverse, order } from "./lib.ts";

export function calculatePrivateKey(publicKey: bigint, p: bigint, q: bigint) {
    return inverse(publicKey, order(p, q));
}

export function encrypt(message: bigint, publicKey: bigint, group: bigint) {
    return exp(message, publicKey, group);
}

export function decrypt(message: bigint, privateKey: bigint, group: bigint) {
    return exp(message, privateKey, group);
}

export function sign(message: bigint, privateKey: bigint, group: bigint) {
    return exp(message, privateKey, group);
}
export function verify(message: bigint, publicKey: bigint, group: bigint) {
    return exp(message, publicKey, group);
}

export function generateRandomPublicKey(n: bigint) {
    let publicKey: bigint = null as unknown as bigint;
    do {
        publicKey = randomBigIntRange(2n, n);
    } while (ggt(publicKey, n) != 1n);
    return publicKey;
}
