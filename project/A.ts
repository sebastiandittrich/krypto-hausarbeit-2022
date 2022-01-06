import { Bit, Bits, chunkBy, flatten, log, padStart, slice, split, toBigInt, toBitArray, Tuple } from "../lib.ts";
import { flow, fork, leaf, map } from "../fp.ts";
import { calculatePrivateKey, encrypt, exp, order, sign } from "../rsa.ts";
import { minides } from "../minides.ts";
import { FeistelNet } from "../feistelnet.ts";
import * as B from "./B.ts";

console.log("----- Config A -----");
const p = 489823n;
console.log(`p = ${p}\\\\`);
const q = 999983n;
console.log(`q = ${q}\\\\`);
export const m = p * q;
console.log(`m = p*q = ${m}\\\\`);
console.log(`order = ${order(p, q)}`);

export const publicKey = 4549500103n;
console.log(`e_A = ${publicKey}\\\\`);
// 489814673009n 39 bit length

const privateKey = calculatePrivateKey(publicKey, p, q);
console.log(`d_A = e_A^(-1) = ${privateKey} \\textrm{ in } \Z_m^* \\\\`);

const deskeys = [
    [0, 1, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 0],
    [1, 1, 0, 0, 1, 1],
] as Bits<6>[];

export const DESImplementation = new FeistelNet<4, 6>(minides({
    expand: ([one, two, three, four]) => [one, one, two, three, three, four],
    sBoxes: [
        [
            [1, 0, 2, 3],
            [3, 2, 0, 1],
        ],
        [
            [2, 3, 0, 1],
            [1, 2, 3, 0],
        ],
    ],
}));

// export const messageHash = flow(toBitArray(), slice(-4), toBigInt());
export const messageHash = (value: bigint) => exp(2n, value, 770663n);

export function send() {
    console.log("------ SEND -------");
    const encryptedAndSignedDESKeys = flow(
        flatten<Bit[]>(),
        toBigInt(),
        // log<bigint>("Message"),
        fork({
            message: toBitArray(),
            signature: flow(messageHash, (value: bigint) => sign(value, privateKey, m), toBitArray(), padStart(40)),
        }, ({ message, signature }) => [...message, ...signature]),
        leaf(
            toBigInt(),
            // log<bigint>("Signed Message"),
        ),
        chunkBy(16),
        // log<Bit[][]>("Signed message chunks"),
        map(toBigInt(), (value: bigint) => encrypt(value, B.publicKey, B.m), toBitArray(), padStart(40)),
        // log<Bit[][]>("Encrypted and signed message chunks"),
        flatten<Bit[]>(),
        toBigInt(),
        // log<bigint>("Encrypted and signed message"),
    )(deskeys);

    const encryptedMessage = flow(
        split(""),
        map(
            (value: string) => BigInt(value.charCodeAt(0)),
            toBitArray(),
            padStart(8),
            chunkBy(4),
            (value: Bit[][]) => DESImplementation.forwards(deskeys, value as Tuple<Bits<4>, 2>),
        ),
    )("Bitcoins");

    return { encryptedAndSignedDESKeys, encryptedMessage };
}
