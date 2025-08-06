export const numberToBits = (num: number): string[] => {
  const bits = num.toString(2).padStart(8, "0");
  return bits.split("");
};

export const formatHex = (num: number, noOfBytes: number = 1): string => {
  return num
    .toString(16)
    .toUpperCase()
    .padStart(noOfBytes * 2, "0");
};
