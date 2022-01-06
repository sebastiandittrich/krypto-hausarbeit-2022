import { Bits, bitsToNumber, bitsXOr, numberToBits, Tuple } from "./lib.ts";

const split = <Length extends number, ToLength extends number>(
    value: Bits<Length>,
    toLength: ToLength,
): Tuple<Bits<ToLength>, 2> => [
    value.slice(0, toLength) as Bits<ToLength>,
    value.slice(toLength, toLength * 2) as Bits<ToLength>,
];

const sbox = (definition: SboxConfiguration, values: Bits<3>): Bits<2> =>
    numberToBits(definition[values[0]][bitsToNumber(values.slice(1))], 2);

type OneToThree = 0 | 1 | 2 | 3;
type SboxConfiguration = [
    [OneToThree, OneToThree, OneToThree, OneToThree],
    [OneToThree, OneToThree, OneToThree, OneToThree],
];
type SboxConfigurations<N extends number> = Tuple<SboxConfiguration, N>;

export const minides = (
    config: { expand: (value: Bits<4>) => Bits<6>; sBoxes: SboxConfigurations<2> },
) => (key: Bits<6>, value: Bits<4>): Bits<4> =>
    split(bitsXOr(config.expand(value), key), 3)
        .map((part, index) => sbox(config.sBoxes[index], part))
        .reduce(
            (combined, current) => [...combined, ...current] as unknown as Bits<4>,
            [] as unknown as Bits<4>,
        );
