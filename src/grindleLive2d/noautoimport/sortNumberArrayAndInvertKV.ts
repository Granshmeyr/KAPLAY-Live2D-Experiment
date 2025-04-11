export function sortNumberArrayAndInvertKV(arr: number[]): number[] {
    const pairs: [number, number][] = arr.map((value, index) => [value, index])
    pairs.sort((a, b) => a[0] - b[0])
    const result: number[] = []
    pairs.forEach(([value, originalIndex]) => {
        result[value] = originalIndex
    })
    return result
}
