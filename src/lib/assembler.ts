import type { AssemblyInstruction } from "../components/assemble-view";
import { opcodeLookup } from "./opcodes-lookup";
import { formatHex } from "./utils";

const findOpcode = (parts: string[]): number | null => {
  for (const indexStr of Object.keys(opcodeLookup)) {
    const index = Number(indexStr);
    const opcode = opcodeLookup[index];
    if (
      opcode.length === parts.length &&
      opcode.every((part, i) => {
        if (part !== "D" && part.startsWith("D")) {
          return parts[i] === "DATA";
        } else {
          return part === parts[i];
        }
      })
    ) {
      return index;
    }
  }
  return null;
};

export const assembler = (
  code: string
): {
  instructions: number[];
  assemblyInstructions: AssemblyInstruction[];
} => {
  const lines = code
    .split("\n")
    .map((line) => line.trim().split(";")[0].trim())
    .filter((line) => line.length > 0);

  const instructions: number[] = [];
  const assemblyInstructions: AssemblyInstruction[] = [];

  const labels: Record<string, number> = {};
  let nextLabel: string | undefined;

  for (let line of lines) {
    const mnemonic = line.split(/\s+/)[0].toUpperCase();

    if (mnemonic.endsWith(":")) {
      const label = mnemonic.slice(0, -1).trim().toUpperCase();
      if (labels[label] !== undefined) {
        throw new Error(`Duplicate label found: ${label}`);
      }
      labels[label] = instructions.length;
      nextLabel = label;
      line = line.slice(mnemonic.length).trim();
      if (line.length === 0) {
        continue;
      }
    }

    const parts = line
      .split(/\s+/)
      .slice(1)
      .join(" ")
      .split(",")
      .map((part) => part.trim().toUpperCase());

    let isMemoryAddress = false;
    let address: number | undefined;
    if (typeof labels[parts[0]] === "number") {
      isMemoryAddress = true;
      address = labels[parts[0]];
    }

    const normalizedParts = isMemoryAddress
      ? ["DATA"]
      : parts
          .map((part) => {
            if (part.length === 0) {
              return undefined;
            }
            if (mnemonic === "RST") {
              return part;
            }
            if (part.length === 1) {
              return part;
            }

            if (part.endsWith("H")) {
              return "DATA";
            } else if (part.endsWith("B")) {
              return "DATA";
            } else if (part.endsWith("O")) {
              return "DATA";
            } else if (!isNaN(Number(part))) {
              return "DATA";
            }
          })
          .filter((part) => part !== undefined);

    const opcode = findOpcode([mnemonic, ...normalizedParts]);

    if (opcode === null) {
      throw new Error(`Unknown mnemonic or invalid syntax: ${line}`);
    }

    let oprandSize = 0;
    if (opcodeLookup[opcode].includes("D8")) {
      oprandSize = 1;
    } else if (opcodeLookup[opcode].includes("D16")) {
      oprandSize = 2;
    }

    instructions.push(opcode);
    assemblyInstructions.push({
      address: formatHex(instructions.length - 1, 2),
      label: nextLabel || "",
      mnemonic: `${mnemonic} ${parts.join(",")}`,
      hexCode: formatHex(opcode),
      bytes: 1 + oprandSize,
      mCycles: 0,
      tStates: 0,
    });
    nextLabel = undefined;
    if (oprandSize > 0) {
      if (isMemoryAddress && address !== undefined) {
        console.log("Using address from label:", address);
        const data = extractBytes(address, 2);
        for (const byte of data) {
          assemblyInstructions.push({
            address: formatHex(instructions.length, 2),
            label: "",
            mnemonic: "",
            bytes: 0,
            hexCode: formatHex(byte),
            mCycles: 0,
            tStates: 0,
          });
          instructions.push(byte);
        }
      } else {
        const data = extractData(parts[parts.length - 1], oprandSize);
        for (const byte of data) {
          assemblyInstructions.push({
            address: formatHex(instructions.length, 2),
            label: "",
            mnemonic: "",
            bytes: 0,
            hexCode: formatHex(byte),
            mCycles: 0,
            tStates: 0,
          });
          instructions.push(byte);
        }
      }
    }
  }

  return {
    instructions,
    assemblyInstructions,
  };
};

const extractData = (rawData: string, bytes: number): number[] => {
  const data: number[] = [];
  let value: number;
  const type = rawData.slice(-1).toLowerCase();
  const rawValue = rawData.slice(0, -1);

  if (type === "h") {
    value = parseInt(rawValue, 16);
  } else if (type === "o") {
    value = parseInt(rawValue, 8);
  } else if (type === "b") {
    value = parseInt(rawValue, 2);
  } else {
    value = parseInt(rawData, 10);
  }

  for (let i = 0; i < bytes; i++) {
    data.unshift((value >> (i * 8)) & 0xff);
  }

  return data.reverse();
};

const extractBytes = (data: number, noOfBytes: number): number[] => {
  const bytes: number[] = [];
  for (let i = 0; i < noOfBytes; i++) {
    bytes.unshift((data >> (i * 8)) & 0xff);
  }
  return bytes.reverse();
};
