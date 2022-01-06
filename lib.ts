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

export function toBitArray() {
    return (value: bigint) => value.toString(2).split("").map((bit) => parseInt(bit) as Bit);
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
export function flatten<T>() {
    return (value: T[]) => value.flat();
}
export function slice(from: number, to?: number) {
    return (value: Bit[]) => value.slice(from, to);
}
export function split(char: string) {
    return (value: string) => value.split(char);
}
