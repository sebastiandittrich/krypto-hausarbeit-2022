import { flow, map } from "./fp.ts";

export type Tuple<T, N extends number> = N extends N ? number extends N ? T[] : _TupleOf<T, N, []> : never;
export type _TupleOf<T, N extends number, R extends unknown[]> = R["length"] extends N ? R : _TupleOf<T, N, [T, ...R]>;
export type Bit = 0 | 1;
export type Bits<N extends number> = Tuple<Bit, N>;

export const bitsToNumber = (bits: Bits<number>) => parseInt(bits.join(""), 2);
export const numberToBits = <Length extends number>(number: number, length: Length): Bits<Length> =>
    number.toString(2).padStart(length, "0").split("").map((n) => parseInt(n)) as Bits<Length>;

export const bitsXOr = <Length extends number>(one: Bits<Length>, two: Bits<Length>): Bits<Length> =>
    numberToBits<Length>(bitsToNumber(one) ^ bitsToNumber(two), one.length as Length);

export function splitBy<T>(value: Array<T>, by: number) {
    return Array.from({ length: Math.ceil(value.length / by) }, (_, i) => value.slice(by * i, by * i + by));
}

export function toBitArray<Width extends number>(width: Width = 0 as Width) {
    return (value: bigint) =>
        value.toString(2).padStart(width, "0").split("").map((bit) => parseInt(bit) as Bit) as Bits<Width>;
}
export function toBigInt() {
    return (value: Bit[]) => BigInt(`0b${value.join("")}`);
}
export function padStart(number: number) {
    return (value: Bit[]) => value.join("").padStart(number, "0").split("").map((bit) => parseInt(bit) as Bit);
}
export function log<T>(name: string) {
    return (value: T) => {
        console.log(`${name}:`, value);
        return value;
    };
}
export function chunkBy(by: number) {
    return (value: Bit[]) => splitBy(padStart(by * Math.ceil(value.length / by))(value), by);
}
export function dechunkBy(by: number) {
    return (value: Bit[]) => splitBy(value.slice(value.length % by), by);
}
export function flatten<T>() {
    return (value: T[]) => value.flat();
}
export function slice(from: number, to?: number) {
    return (value: Bit[]) => value.slice(from, to);
}
export function split(char: string) {
    return (value: string) => value.split(char);
}
export function toCharCode(at = 0) {
    return (value: string) => BigInt(value.charCodeAt(at));
}
export function fromCharCode() {
    return (value: bigint) => String.fromCharCode(Number(value));
}
export function toCharCodes() {
    return flow(split(""), map(toCharCode()));
}
export function join<T>(connector: string) {
    return (value: T[]) => value.join(connector);
}

export function ggtHistory(one: bigint, two: bigint) {
    const history: [bigint, bigint, bigint, bigint][] = [];
    while (one % two != 0n) {
        const remainder = one % two;
        const factor = (one - remainder) / two;
        history.push([one, two, factor, remainder]);
        [one, two] = [two, one % two];
    }
    return history;
}
export function ggt(one: bigint, two: bigint) {
    while (one % two != 0n) {
        [one, two] = [two, one % two];
    }
    return two;
}
export function linearCombination(one: bigint, two: bigint): [bigint, bigint] {
    return ggtHistory(one, two)
        .reduceRight(([x, y], [_1, _2, factor]) => [y, x - factor * y], [0n, 1n]);
}
export function linearCombinationHistory(one: bigint, two: bigint): [bigint, bigint][] {
    return ggtHistory(one, two)
        .reduceRight(([[x, y], ...other], [_1, _2, factor]) => [[y, x - factor * y], [x, y], ...other], [[0n, 1n]])
        .reverse() as [bigint, bigint][];
}
export function inverse(number: bigint, group: bigint) {
    return (group + (linearCombination(group, number)[1] % group)) % group;
}
export function order(p: bigint, q: bigint) {
    return (p - 1n) * (q - 1n);
}
export function exp(base: bigint, exponent: bigint, group: bigint): bigint {
    if (exponent < 1n) throw new Error(`Invalid Exponent [${exponent}]`);
    else if (exponent == 1n) return base;
    else if (exponent % 2n == 0n) return exp(base ** 2n % group, exponent / 2n, group);
    else return (base * exp(base ** 2n % group, (exponent - 1n) / 2n, group)) % group;
}
/**
 * Tries to find the first primitive root of a group.
 * WARNING: This is a brute-force method, so it will not work efficiently for large numbers!
 */
export function findPrimitiveRoot(order: bigint) {
    let current = 2n;
    while (true) {
        for (let i = 1n; i < order; i++) {
            if (i % 100000n == 0n) {
                console.log("Trying", current, "Round ", i, "of", order, "(", (i * 100n) / order, "%)");
            }
            const value = exp(current, i, order);
            if (value == 1n) {
                if (i == order - 1n) {
                    return current;
                } else {
                    break;
                }
            }
        }
        current++;
    }
}
