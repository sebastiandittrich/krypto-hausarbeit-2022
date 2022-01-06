import { randomBigIntRange } from "https://deno.land/x/random_bigint/mod.ts";
import { Bits, Tuple } from "./lib.ts";

function ggtHistory(one: bigint, two: bigint) {
    const history: [bigint, bigint, bigint, bigint][] = [];
    while (one % two != 0n) {
        const remainder = one % two;
        const factor = (one - remainder) / two;
        history.push([one, two, factor, remainder]);
        [one, two] = [two, one % two];
    }
    return history;
}
function ggt(one: bigint, two: bigint) {
    while (one % two != 0n) {
        [one, two] = [two, one % two];
    }
    return two;
}

function linearCombination(one: bigint, two: bigint): [bigint, bigint] {
    return ggtHistory(one, two)
        .reduceRight(([x, y], [_1, _2, factor]) => [y, x - factor * y], [0n, 1n]);
}

function inverse(number: bigint, group: bigint) {
    return (group + (linearCombination(group, number)[1] % group)) % group;
}

export function order(p: bigint, q: bigint) {
    return (p - 1n) * (q - 1n);
}

export function calculatePrivateKey(publicKey: bigint, p: bigint, q: bigint) {
    return inverse(publicKey, order(p, q));
}

export function exp(base: bigint, exponent: bigint, group: bigint): bigint {
    if (exponent < 1n) throw new Error(`Invalid Exponent [${exponent}]`);
    else if (exponent == 1n) return base;
    else if (exponent % 2n == 0n) return exp(base ** 2n % group, exponent / 2n, group);
    else return (base * exp(base ** 2n % group, (exponent - 1n) / 2n, group)) % group;
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
