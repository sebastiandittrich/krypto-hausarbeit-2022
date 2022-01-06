type Lookup<T, K extends keyof any, Else = never> = K extends keyof T ? T[K] : Else;
type Tail<T extends any[]> = ((...t: T) => void) extends ((x: any, ...u: infer U) => void) ? U : never;
type Func1 = (arg: any) => any;
type ArgType<F, Else = never> = F extends (arg: infer A) => any ? A : Else;
type AsChain<F extends [Func1, ...Func1[]], G extends Func1[] = Tail<F>> = {
    [K in keyof F]: (arg: ArgType<F[K]>) => ArgType<Lookup<G, K, any>, any>;
};
type LastIndexOf<T extends any[]> = ((...x: T) => void) extends ((y: any, ...z: infer U) => void) ? U["length"] : never;

type flow = {
    <F extends [(arg: any) => any, ...Array<(arg: any) => any>]>(
        ...f: F & AsChain<F>
    ): (arg: ArgType<F[0]>) => ReturnType<F[LastIndexOf<F>]>;
};
type leaf = {
    <F extends [(arg: any) => any, ...Array<(arg: any) => any>]>(
        ...f: F & AsChain<F>
    ): (arg: ArgType<F[0]>) => ArgType<F[0]>;
};
type map = {
    <F extends [(arg: any) => any, ...Array<(arg: any) => any>]>(
        ...f: F & AsChain<F>
    ): (arg: ArgType<F[0]>[]) => ReturnType<F[LastIndexOf<F>]>[];
};
type forkAndJoin = {
    <F extends { [key in string]: (arg: Arg) => any }, Arg>(
        f: F,
    ): (arg: Arg) => {
        [key in keyof F]: ReturnType<F[key]>;
    };
    <
        F extends { [key in string]: (arg: Arg) => any },
        Arg,
        Join extends ((arg: { [key in keyof F]: ReturnType<F[key]> }) => any),
    >(
        f: F,
        join?: Join,
    ): (arg: Arg) => ReturnType<Join>;
};

function _flow(...f: ((arg: unknown) => unknown)[]) {
    return (data: unknown) => f.reduce((value, currentF) => currentF(value), data);
}
function _leaf(...f: ((arg: unknown) => unknown)[]) {
    return (data: unknown) => {
        f.reduce((value, currentF) => currentF(value), data);
        return data;
    };
}
function _map(...f: ((arg: unknown) => unknown)[]) {
    return (data: unknown[]) => data.map(_flow(...f));
}
function _fork(
    fs: Record<string, (arg: unknown) => unknown>,
    join: (arg: Record<string, unknown>) => unknown = (value) => value,
) {
    return (data: unknown[]) => join(Object.keys(fs).reduce((newfs, key) => ({ ...newfs, [key]: fs[key](data) }), {}));
}

export const flow: flow = _flow as unknown as flow;
export const leaf: leaf = _leaf as unknown as leaf;
export const map: map = _map as unknown as map;
export const fork: forkAndJoin = _fork as unknown as forkAndJoin;

// const res = flow(
//     (number: number) => number + 1,
//     fork({
//         string: (value: number) => value.toString(),
//         number: (value: number) => value,
//         bin: (value: number) => value.toString(2).split(""),
//     }),
// );
