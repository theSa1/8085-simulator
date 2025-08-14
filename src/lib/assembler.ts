import type { AssemblyInstruction } from "../components/assemble-view";
import { opcodeLookup } from "./opcodes-lookup";
import { formatHex } from "./utils";

// define assembly error type
export class AssemblyError extends Error {
  line?: number;

  constructor(message: string, line?: number) {
    super(message);
    this.line = line;
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, AssemblyError.prototype);
    // Custom error name
    this.name = "AssemblyError";
  }
}

const findOpcode = (parts: string[]): number | null => {
  console.log("Finding opcode for parts:", parts);
  for (const opcodeIndexString of Object.keys(opcodeLookup)) {
    const index = Number(opcodeIndexString);
    const opcode = opcodeLookup[index];
    if (
      opcode.length === parts.length &&
      opcode.every((opcodePart, partIndex) => {
        if (
          partIndex != 0 &&
          opcodePart !== "D" &&
          opcodePart.startsWith("D")
        ) {
          return parts[partIndex] === "DATA";
        } else {
          return opcodePart === parts[partIndex];
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
  const originalLines = code.split("\n");
  const lines: string[] = [];
  const lineNumberMap: number[] = [];

  for (let i = 0; i < originalLines.length; i++) {
    const processedLine = originalLines[i].trim().split(";")[0].trim();
    if (processedLine.length > 0) {
      lineNumberMap.push(i + 1);
      lines.push(processedLine);
    }
  }

  const instructions: number[] = [];
  const assemblyInstructions: AssemblyInstruction[] = [];

  const labels: Record<
    string,
    {
      key: number;
      line: number;
      address?: number;
    }
  > = {};
  lines.forEach((line, lineIndex) => {
    const actualLineNumber = lineNumberMap[lineIndex];
    line = line.trim().split(/\s+/)[0].toUpperCase().trim();
    if (line.endsWith(":")) {
      const label = line.slice(0, -1).trim();

      // Validate label name
      if (!label.match(/^[A-Z_][A-Z0-9_]*$/)) {
        throw new AssemblyError(
          `Invalid label name: ${label}. Labels must start with a letter or underscore and contain only letters, numbers, and underscores.`,
          actualLineNumber
        );
      }

      // Check for reserved keywords
      const reservedKeywords = [
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "H",
        "L",
        "M",
        "PSW",
        "SP",
        "DATA",
      ];
      if (reservedKeywords.includes(label)) {
        throw new AssemblyError(
          `Label name '${label}' is a reserved keyword and cannot be used as a label.`,
          actualLineNumber
        );
      }

      if (labels[label] !== undefined) {
        throw new AssemblyError(
          `Duplicate label found: ${label}`,
          actualLineNumber
        );
      }
      labels[label] = {
        key: 300 + Math.round(Math.random() * 100000),
        line: lineIndex,
      };
    }
  });
  let nextLabel: string | undefined;

  lines.forEach((currentLine, lineIndex) => {
    const actualLineNumber = lineNumberMap[lineIndex];
    let line = currentLine;

    const labelEntry = Object.entries(labels).find(
      ([, label]) => label.line === lineIndex
    );

    if (labelEntry) {
      nextLabel = labelEntry[0];
      labels[labelEntry[0]].address = instructions.length;
      line = line.replace(labelEntry[0] + ":", "").trim();
      if (line.length === 0) {
        return;
      }
    }

    const mnemonic = line.split(/\s+/)[0].toUpperCase();

    // Validate mnemonic
    if (!mnemonic || mnemonic.length === 0) {
      throw new AssemblyError(`Empty instruction found`, actualLineNumber);
    }

    const parts = line
      .split(/\s+/)
      .slice(1)
      .join(" ")
      .split(",")
      .map((part) => part.trim().toUpperCase());

    let isMemoryAddress = false;
    let address: number | undefined;
    if (parts.length > 0 && typeof labels[parts[0]]?.key === "number") {
      isMemoryAddress = true;
      address = labels[parts[0]].key;
    } else if (
      parts.length > 0 &&
      parts[0] &&
      !parts[0].match(/^(A|B|C|D|E|F|H|L|M|PSW|SP|DATA)$/) &&
      !parts[0].match(/^\d/) &&
      !parts[0].endsWith("H") &&
      !parts[0].endsWith("B") &&
      !parts[0].endsWith("O")
    ) {
      // Check if this looks like a label reference but the label doesn't exist
      const potentialLabel = parts[0];
      if (!labels[potentialLabel]) {
        throw new AssemblyError(
          `Undefined label reference: ${potentialLabel}`,
          actualLineNumber
        );
      }
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

            if (part.length !== 1 || !isNaN(Number(part[0]))) {
              if (part.endsWith("H")) {
                return "DATA";
              } else if (part.endsWith("B")) {
                return "DATA";
              } else if (part.endsWith("O")) {
                return "DATA";
              } else if (!isNaN(Number(part))) {
                return "DATA";
              }
            }

            return part;
          })
          .filter((part) => part !== undefined);

    const opcode = findOpcode([mnemonic, ...normalizedParts]);

    if (opcode === null) {
      throw new AssemblyError(
        `Unknown mnemonic or invalid syntax: ${line}`,
        actualLineNumber
      );
    }

    let operandSize = 0;
    if (opcodeLookup[opcode].includes("D8")) {
      operandSize = 1;
    } else if (opcodeLookup[opcode].includes("D16")) {
      operandSize = 2;
    }

    instructions.push(opcode);
    assemblyInstructions.push({
      address: formatHex(instructions.length - 1, 2),
      label: nextLabel || "",
      mnemonic: `${mnemonic} ${parts.join(",")}`,
      hexCode: formatHex(opcode),
      bytes: 1 + operandSize,
      mCycles: 0,
      tStates: 0,
    });
    nextLabel = undefined;
    if (operandSize > 0) {
      if (isMemoryAddress && address !== undefined) {
        for (const addressByte of [address, address + 1]) {
          assemblyInstructions.push({
            address: formatHex(instructions.length, 2),
            label: "",
            mnemonic: "",
            bytes: 0,
            hexCode: addressByte.toString(),
            mCycles: 0,
            tStates: 0,
          });
          instructions.push(addressByte);
        }
      } else {
        try {
          const data = extractData(parts[parts.length - 1], operandSize);
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
        } catch (error) {
          throw new AssemblyError(
            `Invalid data format: ${parts[parts.length - 1]} - ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
            actualLineNumber
          );
        }
      }
    }
  });

  instructions.forEach((byte, byteIndex) => {
    const labelEntry = Object.entries(labels).find(
      ([, label]) => label.key === byte
    );

    if (labelEntry) {
      const labelAddress = labelEntry[1].address;
      if (labelAddress === undefined) {
        throw new AssemblyError(
          `Label '${labelEntry[0]}' is referenced but not properly resolved.`
        );
      }
      const bytes = extractBytes(labelAddress, 2);
      instructions[byteIndex] = bytes[0];
      instructions[byteIndex + 1] = bytes[1];
      assemblyInstructions[byteIndex].hexCode = formatHex(bytes[0]);
      assemblyInstructions[byteIndex + 1].hexCode = formatHex(bytes[1]);
    }
  });

  return {
    instructions,
    assemblyInstructions,
  };
};

const extractData = (rawData: string, byteCount: number): number[] => {
  const data: number[] = [];
  let value: number;
  const numberType = rawData.slice(-1).toLowerCase();
  const numberValue = rawData.slice(0, -1);

  try {
    if (numberType === "h") {
      value = parseInt(numberValue, 16);
      if (isNaN(value)) {
        throw new Error(`Invalid hexadecimal value: ${numberValue}`);
      }
    } else if (numberType === "o") {
      value = parseInt(numberValue, 8);
      if (isNaN(value)) {
        throw new Error(`Invalid octal value: ${numberValue}`);
      }
    } else if (numberType === "b") {
      value = parseInt(numberValue, 2);
      if (isNaN(value)) {
        throw new Error(`Invalid binary value: ${numberValue}`);
      }
    } else {
      value = parseInt(rawData, 10);
      if (isNaN(value)) {
        throw new Error(`Invalid decimal value: ${rawData}`);
      }
    }

    // Check if value fits in the required byte count
    const maxValue = (1 << (byteCount * 8)) - 1;
    if (value < 0) {
      throw new Error(`Negative values are not allowed: ${value}`);
    }
    if (value > maxValue) {
      throw new Error(
        `Value ${value} exceeds maximum for ${byteCount} byte(s): ${maxValue}`
      );
    }

    for (let byteIndex = 0; byteIndex < byteCount; byteIndex++) {
      data.unshift((value >> (byteIndex * 8)) & 0xff);
    }

    return data.reverse();
  } catch (error) {
    throw new Error(
      `Data extraction failed for "${rawData}": ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

const extractBytes = (value: number, byteCount: number): number[] => {
  if (value < 0) {
    throw new Error(`Negative address values are not allowed: ${value}`);
  }

  const maxValue = (1 << (byteCount * 8)) - 1;
  if (value > maxValue) {
    throw new Error(
      `Address value ${value} exceeds maximum for ${byteCount} byte(s): ${maxValue}`
    );
  }

  const bytes: number[] = [];
  for (let byteIndex = 0; byteIndex < byteCount; byteIndex++) {
    bytes.unshift((value >> (byteIndex * 8)) & 0xff);
  }
  return bytes.reverse();
};
