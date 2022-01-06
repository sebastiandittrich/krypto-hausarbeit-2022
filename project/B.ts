import { Bit, Bits, chunkBy, flatten, log, padStart, slice, toBigInt, toBitArray, Tuple } from "../lib.ts";
import { flow, fork, leaf, map } from "../fp.ts";
import { calculatePrivateKey, decrypt, order, verify } from "../rsa.ts";
import * as A from "./A.ts";

console.log("----- Config B -----");
const p = 882551n;
console.log(`p = ${p}`);
const q = 767617n;
console.log(`q = ${q}`);
export const m = p * q;
console.log(`m = ${m}`);
console.log(`order = ${order(p, q)}`);

export const publicKey = 734981927n;
console.log(`publicKey = ${publicKey}`);
// 40 bit length

const privateKey = calculatePrivateKey(publicKey, p, q);
console.log(`privateKey = ${privateKey}`);

export function receive(
    { encryptedAndSignedDESKeys, encryptedMessage }: {
        encryptedAndSignedDESKeys: bigint;
        encryptedMessage: Tuple<Bits<4>, 2>[];
    },
) {
    console.log("------ RECEIVE -------");

    const decryptSignedMessage = flow(
        toBitArray(),
        chunkBy(40),
        leaf(
            map(toBigInt()),
            // log("Encrypted and signed message chunks"),
        ),
        map(toBigInt(), (value: bigint) => decrypt(value, privateKey, m), toBitArray(), padStart(16)),
        leaf(
            map(toBigInt()),
            // log("Signed message chunks"),
        ),
        flatten<Bit[]>(),
        fork({
            signedMessageHash: flow(
                slice(-40),
                toBigInt(),
                // log<bigint>("Signature"),
                (value: bigint) => verify(value, A.publicKey, A.m),
                // log<bigint>("Signed message hash"),
            ),
            message: flow(
                slice(0, -40),
                toBigInt(),
                // log<bigint>("Message"),
                fork({
                    value: (v: bigint) => v,
                    hash: flow(A.messageHash /* log<bigint>("Message hash") */),
                }),
            ),
        }, ({ signedMessageHash, message: { hash, value: message } }) => {
            if (hash != signedMessageHash) throw new Error("Signature does not Match!");
            return message;
        }),
    );

    const message = decryptSignedMessage(encryptedAndSignedDESKeys);

    const deskeys = flow(
        toBitArray(),
        chunkBy(6),
        // log<Bit[][]>("DES Keys"),
    )(message) as Bits<6>[];

    const decrypted = flow(
        map((value: Tuple<Bits<4>, 2>) => A.DESImplementation.backwards(deskeys, value), flatten<Bit[]>()),
        flatten<Bit[]>(),
        // log<Bit[]>("Decrypted"),
        chunkBy(8),
        map((value: Bit[]) => String.fromCharCode(parseInt(value.join(""), 2))),
        (value: string[]) => value.join(""),
        // log<string>("Decoded"),
    )(encryptedMessage);

    return decrypted;
}
