import {
    Bit,
    Bits,
    chunkBy,
    exp,
    flatten,
    log,
    order,
    padStart,
    split,
    toBigInt,
    toBitArray,
    Tuple,
} from "../lib/lib.ts";
import { flow, fork, leaf, map } from "../lib/fp.ts";
import { calculatePrivateKey, encrypt, sign } from "../lib/rsa.ts";
import { createMiniDES } from "../lib/minides.ts";
import { FeistelNet } from "../lib/index.ts";
import * as B from "./B.ts";

console.log("----- Config A -----");
const p = 489823n;
console.log(`p = ${p}`);
const q = 999983n;
console.log(`q = ${q}`);
export const m = p * q;
console.log(`m = p*q = ${m}`);
console.log(`order = ${order(p, q)}`);

export const publicKey = 4549500103n;
console.log(`publicKey = ${publicKey}`);
// 489814673009n 39 bit length

const privateKey = calculatePrivateKey(publicKey, p, q);
console.log(`privateKey = ${privateKey}`);

const deskeys = [
    [0, 1, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 0],
    [1, 1, 0, 0, 1, 1],
] as Bits<6>[];

export const DESImplementation = new FeistelNet<4, 6>(createMiniDES({
    expand: ([one, two, three, four]) => [one, four, three, two, four, one],
    sBoxes: [
        [
            [0, 3, 1, 2],
            [2, 3, 0, 1],
        ],
        [
            [2, 1, 3, 0],
            [0, 1, 2, 3],
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
            signature: flow(
                messageHash,
                log<bigint>("Message hash"),
                (value: bigint) => sign(value, privateKey, m),
                log<bigint>("Signed message hash"),
                toBitArray(),
                padStart(40),
                log<Bit[]>("Padded binary signed message hash"),
            ),
        }, ({ message, signature }) => [...message, ...signature]),
        leaf(
            toBigInt(),
            log<bigint>("Signed Message"),
        ),
        chunkBy(16),
        log<Bit[][]>("Signed message chunks"),
        map(
            toBigInt(),
            log<bigint>("Signed message chunks (bigint)"),
            (value: bigint) => encrypt(value, B.publicKey, B.m),
            log<bigint>("Encrypted and signed message chunks (bigint)"),
            toBitArray(),
            padStart(40),
        ),
        leaf(
            map((value: Bit[]) => value.join("")),
            log<string[]>("Encrypted and signed message chunks"),
        ),
        flatten<Bit[]>(),
        leaf(
            (value: Bit[]) => value.join(""),
            log<string>("Encrypted and signed message"),
        ),
        toBigInt(),
        log<bigint>("Encrypted and signed message"),
    )(deskeys);

    function join<T extends string | number>(by: string) {
        return (value: T[]) => value.join(by);
    }

    const encryptedMessage = flow(
        split(""),
        map(
            (value: string) => BigInt(value.charCodeAt(0)),
            toBitArray(),
        ),
        leaf(
            map(join<Bit>("")),
            join(""),
            log<string>("Encoded string"),
        ),
        map(
            padStart(8),
            chunkBy(4),
            (value: Bit[][]) => DESImplementation.forwards(deskeys, value as Tuple<Bits<4>, 2>),
        ),
        leaf(
            (value: Tuple<Bits<4>, 2>[]) => value,
            map(map(join("")), join("")),
            join(""),
            log<string>("DES encrypted string"),
        ),
    )("Bitcoins");

    return { encryptedAndSignedDESKeys, encryptedMessage };
}
