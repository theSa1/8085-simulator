import { opcodeLookup } from "./opcodes-lookup";

export class CPU8085 {
  constructor(cpu?: CPU8085) {
    if (cpu) {
      this.registers = cpu.registers;
      this.memory = new Uint8Array(cpu.memory);
      this.isHalted = cpu.isHalted;
      this.lastRanInstruction = cpu.lastRanInstruction;
    }
  }

  registers: { [key: string]: number } = {
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    E: 0,
    H: 0,
    L: 0,
    SP: 0,
    PC: 0,
    FLAG: 0,
  };
  memory: Uint8Array = new Uint8Array(2 ** 16);
  isHalted: boolean = true;
  lastRanInstruction: number | null = null;

  reset() {
    this.registers = {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      E: 0,
      H: 0,
      L: 0,
      SP: 0x0000,
      PC: 0,
      FLAG: 0,
    };
    this.memory.fill(0);
    this.isHalted = true;
    this.lastRanInstruction = null;
  }

  loadProgram(program: number[]) {
    this.memory.set(program, 0);
  }

  setMemory(address: number, value: number) {
    if (address < 0 || address >= 65536) {
      throw new Error("Memory address out of bounds");
    }
    this.memory[address] = this.fb(value);
  }

  runProgram() {
    this.isHalted = false;
    this.registers.PC = 0;
    while (this.registers.PC < this.memory.length) {
      if (this.isHalted) {
        break;
      }
      const opcode = this.memory[this.registers.PC];
      this.executeOpcode(opcode);
      this.registers.PC++;
    }
  }

  runSingleStep() {
    const opcode = this.memory[this.registers.PC];
    this.lastRanInstruction = this.registers.PC;
    this.executeOpcode(opcode);
    this.registers.PC++;
  }

  executeOpcode(opcode: number) {
    const mnemonic = opcodeLookup[opcode];
    if (!mnemonic) {
      throw new Error(`Unknown opcode: ${opcode.toString(16)}`);
    }

    let value: number;
    switch (mnemonic[0]) {
      case "NOP":
        // No operation
        break;

      case "MOV":
        const dest = mnemonic[1];
        const src = mnemonic[2];
        if (src === "M") {
          value = this.getAddressValue(this.getMemoryPointer());
        } else {
          value = this.getRegisterValue(src);
        }
        if (dest === "M") {
          this.setMemory(this.getMemoryPointer(), value);
        } else {
          this.setRegisterValue(dest, value);
        }
        break;

      case "MVI":
        const reg = mnemonic[1];
        const immediateValue = this.memory[this.registers.PC + 1];
        if (reg === "M") {
          this.setMemory(this.getMemoryPointer(), immediateValue);
        } else {
          this.setRegisterValue(reg, immediateValue);
        }
        this.registers.PC++;
        break;

      case "LDA":
        const address = this.concat2Bytes(
          this.memory[this.registers.PC + 2],
          this.memory[this.registers.PC + 1]
        );
        this.registers.A = this.getAddressValue(address);
        this.registers.PC += 2;
        break;
      case "LDAX":
        value = this.getRegisterPairValue(mnemonic[1]);
        this.registers.A = this.getAddressValue(value);
        break;

      case "LXI":
        const regPair = mnemonic[1];
        const lowByte = this.memory[this.registers.PC + 1];
        const highByte = this.memory[this.registers.PC + 2];
        if (regPair === "B") {
          this.registers.B = highByte;
          this.registers.C = lowByte;
        } else if (regPair === "D") {
          this.registers.D = highByte;
          this.registers.E = lowByte;
        } else if (regPair === "H") {
          this.registers.H = highByte;
          this.registers.L = lowByte;
        } else if (regPair === "SP") {
          this.registers.SP = this.concat2Bytes(highByte, lowByte);
        }
        this.registers.PC += 2;
        break;

      case "LHLD":
        const addr = this.concat2Bytes(
          this.memory[this.registers.PC + 2],
          this.memory[this.registers.PC + 1]
        );
        this.registers.L = this.getAddressValue(addr);
        this.registers.H = this.getAddressValue(addr + 1);
        this.registers.PC += 2;
        break;

      case "STA":
        const staAddress = this.concat2Bytes(
          this.memory[this.registers.PC + 2],
          this.memory[this.registers.PC + 1]
        );
        this.setAddressValue(staAddress, this.registers.A);
        this.registers.PC += 2;
        break;

      case "STAX":
        value = this.getRegisterPairValue(mnemonic[1]);
        this.setAddressValue(value, this.registers.A);
        break;

      case "SHLD":
        const shldAddress = this.concat2Bytes(
          this.memory[this.registers.PC + 2],
          this.memory[this.registers.PC + 1]
        );
        this.setAddressValue(shldAddress, this.registers.L);
        this.setAddressValue(shldAddress + 1, this.registers.H);
        this.registers.PC += 2;
        break;

      case "XCHG":
        // Exchange H and L with D and E
        const tempH = this.registers.H;
        const tempL = this.registers.L;
        this.registers.H = this.registers.D;
        this.registers.L = this.registers.E;
        this.registers.D = tempH;
        this.registers.E = tempL;
        break;

      case "SPHL":
        // Set Stack Pointer to HL
        this.registers.SP = this.concat2Bytes(
          this.registers.H,
          this.registers.L
        );
        break;

      case "XTHL":
        const spValue = this.registers.SP;
        const tempL1 = this.getAddressValue(spValue);
        const tempH1 = this.getAddressValue(spValue + 1);
        this.setAddressValue(spValue, this.registers.L);
        this.setAddressValue(spValue + 1, this.registers.H);
        this.registers.L = tempL1;
        this.registers.H = tempH1;
        this.registers.SP = spValue;
        break;

      case "PUSH":
        const pushRegPair = mnemonic[1];
        if (pushRegPair === "PSW") {
          value = this.concat2Bytes(this.registers.A, this.registers.FLAG);
        } else {
          value = this.getRegisterPairValue(pushRegPair);
        }
        this.pushToStack(value);
        break;

      case "POP":
        const popRegPair = mnemonic[1];
        value = this.popFromStack();
        if (popRegPair === "PSW") {
          this.registers.A = (value >> 8) & 0xff;
          this.registers.FLAG = value & 0xff;
        } else {
          this.setRegisterPairValue(popRegPair, value);
        }
        break;

      case "OUT":
        // TODO: Implement OUT
        break;

      case "IN":
        // TODO: Implement IN
        break;

      case "ADD":
        const register = mnemonic[1];
        if (register === "M") {
          value = this.getAddressValue(this.getMemoryPointer());
        } else {
          value = this.getRegisterValue(mnemonic[1]);
        }
        this.registers.A = this.addBytes(this.registers.A, value);
        break;

      case "ADC":
        const adcRegister = mnemonic[1];
        if (adcRegister === "M") {
          value = this.getAddressValue(this.getMemoryPointer());
        } else {
          value = this.getRegisterValue(adcRegister);
        }
        this.registers.A = this.addBytes(this.registers.A, value, true);
        break;

      case "ADI":
        value = this.memory[this.registers.PC + 1];
        this.registers.A = this.addBytes(this.registers.A, value);
        this.registers.PC++;
        break;

      case "ACI":
        value = this.memory[this.registers.PC + 1];
        this.registers.A = this.addBytes(this.registers.A, value, true);
        this.registers.PC++;
        break;

      case "DAD":
        const dadRegPair = mnemonic[1];
        const currentDADValue = this.getRegisterPairValue(dadRegPair);
        const hlValue = this.concat2Bytes(this.registers.H, this.registers.L);
        const result = currentDADValue + hlValue;
        this.setFlagBit(result > 0xffff, 0);
        this.setRegisterPairValue("H", result & 0xffff);
        break;

      case "SUB":
        const subRegister = mnemonic[1];
        if (subRegister === "M") {
          value = this.getAddressValue(this.getMemoryPointer());
        } else {
          value = this.getRegisterValue(subRegister);
        }
        this.registers.A = this.subBytes(this.registers.A, value);
        break;

      case "SBB":
        const sbbRegister = mnemonic[1];
        if (sbbRegister === "M") {
          value = this.getAddressValue(this.getMemoryPointer());
        } else {
          value = this.getRegisterValue(sbbRegister);
        }
        this.registers.A = this.subBytes(this.registers.A, value, true);
        break;

      case "SUI":
        value = this.memory[this.registers.PC + 1];
        this.registers.A = this.subBytes(this.registers.A, value);
        this.registers.PC++;
        break;

      case "SBI":
        value = this.memory[this.registers.PC + 1];
        this.registers.A = this.subBytes(this.registers.A, value, true);
        this.registers.PC++;
        break;

      case "INR":
        const incRegister = mnemonic[1];
        if (incRegister === "M") {
          value = this.getAddressValue(this.getMemoryPointer());
          value = this.addBytes(value, 1, false, false);
          this.setAddressValue(this.getMemoryPointer(), value);
        } else {
          value = this.getRegisterValue(incRegister);
          value = this.addBytes(value, 1, false, false);
          this.setRegisterValue(incRegister, value);
        }
        break;

      case "INX":
        const incRegPair = mnemonic[1];
        const currentValue = this.getRegisterPairValue(incRegPair);
        this.setRegisterPairValue(incRegPair, currentValue + 1);
        break;

      case "DCR":
        const decRegister = mnemonic[1];
        if (decRegister === "M") {
          value = this.getAddressValue(this.getMemoryPointer());
          value = this.subBytes(value, 1, false, false);
          this.setAddressValue(this.getMemoryPointer(), value);
        } else {
          value = this.getRegisterValue(decRegister);
          value = this.subBytes(value, 1, false, false);
          this.setRegisterValue(decRegister, value);
        }
        break;

      case "DCX":
        const decRegPair = mnemonic[1];
        const currentDecValue = this.getRegisterPairValue(decRegPair);
        this.setRegisterPairValue(decRegPair, currentDecValue - 1);
        break;

      case "DAA":
        // TODO: Implement DAA
        break;

      case "JMP":
      case "JC":
      case "JNC":
      case "JP":
      case "JM":
      case "JZ":
      case "JNZ":
      case "JPE":
      case "JPO":
        this.handleJumpInstruction(mnemonic[0]);
        break;

      case "CALL":
      case "CC":
      case "CNC":
      case "CP":
      case "CM":
      case "CZ":
      case "CNZ":
      case "CPE":
      case "CPO":
        this.handleCallInstruction(mnemonic[0]);
        break;

      case "RET":
      case "RC":
      case "RNC":
      case "RP":
      case "RM":
      case "RZ":
      case "RNZ":
      case "RPE":
      case "RPO":
        this.handleReturnInstruction(mnemonic[0]);
        break;

      case "RST":
        const rstAddress = parseInt(mnemonic[1]) * 8;
        this.registers.PC = rstAddress - 1;
        break;

      case "PCHL":
        this.registers.PC = this.concat2Bytes(
          this.registers.H,
          this.registers.L
        );
        this.registers.PC--;
        break;

      case "CMP":
        const cmpRegister = mnemonic[1];
        if (cmpRegister === "M") {
          value = this.getAddressValue(this.getMemoryPointer());
        } else {
          value = this.getRegisterValue(cmpRegister);
        }
        const aValue = this.registers.A;
        if (aValue < value) {
          this.setFlagBit(true, 0);
        } else {
          this.setFlagBit(false, 0);
        }
        this.updateFlags(aValue - value);
        break;

      case "CPI":
        value = this.memory[this.registers.PC + 1];
        const aValueCPI = this.registers.A;
        if (aValueCPI < value) {
          this.setFlagBit(true, 0);
        } else {
          this.setFlagBit(false, 0);
        }
        this.updateFlags(aValueCPI - value);
        this.registers.PC++;
        break;

      case "ANA":
        const anaRegister = mnemonic[1];
        if (anaRegister === "M") {
          value = this.getAddressValue(this.getMemoryPointer());
        } else {
          value = this.getRegisterValue(anaRegister);
        }
        this.registers.A &= value;
        this.updateFlags(this.registers.A);
        this.setFlagBit(false, 0);
        this.setFlagBit(true, 4);
        break;

      case "ANI":
        value = this.memory[this.registers.PC + 1];
        this.registers.A &= value;
        this.updateFlags(this.registers.A);
        this.registers.PC++;
        this.setFlagBit(false, 0);
        this.setFlagBit(true, 4);
        break;

      case "XRA":
        const xraRegister = mnemonic[1];
        if (xraRegister === "M") {
          value = this.getAddressValue(this.getMemoryPointer());
        } else {
          value = this.getRegisterValue(xraRegister);
        }
        this.registers.A ^= value;
        this.updateFlags(this.registers.A);
        this.setFlagBit(false, 0);
        this.setFlagBit(false, 4);
        break;

      case "XRI":
        value = this.memory[this.registers.PC + 1];
        this.registers.A ^= value;
        this.updateFlags(this.registers.A);
        this.registers.PC++;
        this.setFlagBit(false, 0);
        this.setFlagBit(false, 4);
        break;

      case "ORA":
        const oraRegister = mnemonic[1];
        if (oraRegister === "M") {
          value = this.getAddressValue(this.getMemoryPointer());
        } else {
          value = this.getRegisterValue(oraRegister);
        }
        this.registers.A |= value;
        this.updateFlags(this.registers.A);
        this.setFlagBit(false, 0);
        this.setFlagBit(false, 4);
        break;

      case "ORI":
        value = this.memory[this.registers.PC + 1];
        this.registers.A |= value;
        this.updateFlags(this.registers.A);
        this.setFlagBit(false, 0);
        this.setFlagBit(false, 4);
        this.registers.PC++;
        break;

      case "RLC":
        const carryBit = (this.registers.A & 0x80) >> 7;
        this.registers.A = ((this.registers.A << 1) | carryBit) & 0xff;
        this.setFlagBit(carryBit === 1, 0);
        break;

      case "RRC":
        const carryBitRRC = this.registers.A & 0x01;
        this.registers.A = (this.registers.A >> 1) | (carryBitRRC << 7);
        this.setFlagBit(carryBitRRC === 1, 0);
        break;

      case "RAL":
        const carryBitRAL = (this.registers.A & 0x80) >> 7;
        this.registers.A =
          ((this.registers.A << 1) | this.getFlagBit(0)) & 0xff;
        this.setFlagBit(carryBitRAL === 1, 0);
        break;

      case "RAR":
        const carryBitRAR = this.registers.A & 0x01;
        this.registers.A = (this.registers.A >> 1) | (this.getFlagBit(0) << 7);
        this.setFlagBit(carryBitRAR === 1, 0);
        break;

      case "CMA":
        this.registers.A = ~this.registers.A & 0xff;
        this.updateFlags(this.registers.A);
        break;

      case "CMC":
        this.setFlagBit(!this.getFlagBit(0), 0);
        break;

      case "STC":
        this.setFlagBit(true, 0);
        break;

      case "HLT":
        this.isHalted = true;
        break;

      default:
        console.error(`Unhandled opcode: ${mnemonic}`);
    }
  }

  getMemoryPointer(): number {
    return this.concat2Bytes(this.registers.H, this.registers.L);
  }

  getAddressValue(address: number): number {
    if (address < 0 || address >= 65536) {
      throw new Error("Memory address out of bounds");
    }
    return this.memory[address];
  }

  setAddressValue(address: number, value: number) {
    if (address < 0 || address >= 65536) {
      throw new Error("Memory address out of bounds");
    }
    this.memory[address] = this.fb(value);
  }

  getRegisterValue(register: string): number {
    if (register in this.registers) {
      return this.registers[register];
    }
    throw new Error(`Invalid register: ${register}`);
  }

  setRegisterValue(register: string, value: number) {
    if (register in this.registers) {
      this.registers[register] = this.fb(value);
    } else {
      throw new Error(`Invalid register: ${register}`);
    }
  }

  getRegisterPairValue(pair: string): number {
    if (pair === "B") {
      return this.concat2Bytes(this.registers.B, this.registers.C);
    } else if (pair === "D") {
      return this.concat2Bytes(this.registers.D, this.registers.E);
    } else if (pair === "H") {
      return this.concat2Bytes(this.registers.H, this.registers.L);
    } else if (pair === "SP") {
      return this.registers.SP;
    }
    throw new Error(`Invalid register pair: ${pair}`);
  }

  setRegisterPairValue(pair: string, value: number) {
    if (pair === "B") {
      this.registers.B = (value >> 8) & 0xff;
      this.registers.C = value & 0xff;
    } else if (pair === "D") {
      this.registers.D = (value >> 8) & 0xff;
      this.registers.E = value & 0xff;
    } else if (pair === "H") {
      this.registers.H = (value >> 8) & 0xff;
      this.registers.L = value & 0xff;
    } else if (pair === "SP") {
      this.registers.SP = value & 0xffff;
    } else {
      throw new Error(`Invalid register pair: ${pair}`);
    }
  }

  // compare(val: number): void {
  //   const a = this.registers.A;

  //   const result = this.subBytes(a, val);
  //   this.flags.Z = result === 0 ? 1 : 0; // Zero flag
  //   this.flags.S = (result & 0x80) !== 0 ? 1 : 0; // Sign flag
  //   this.flags.P = this.isParity(result) ? 1 : 0; // Parity flag
  //   this.flags.CY = a < val ? 1 : 0; // Carry flag
  //   this.flags.AC = ((a & 0x0f) < (val & 0x0f)) ? 1 : 0; // Auxiliary carry flag
  // }

  fb(val: number): number {
    return val & 0xff;
  }

  concat2Bytes(high: number, low: number): number {
    return (high << 8) | low;
  }

  private addBytes(
    a: number,
    b: number,
    useCarry: boolean = false,
    updateCarry: boolean = true
  ): number {
    const carryIn = useCarry ? this.getFlagBit(0) : 0; // Get carry before calculation
    let result = a + b + carryIn;

    if (updateCarry) {
      this.setFlagBit(result > 0xff, 0);
    }
    this.setFlagBit((a & 0x0f) + (b & 0x0f) + carryIn > 0x0f, 4); // Auxiliary carry
    this.updateFlags(result & 0xff);

    return this.fb(result & 0xff);
  }

  private subBytes(
    a: number,
    b: number,
    useBorrow: boolean = false,
    updateCarry: boolean = true
  ): number {
    const borrowIn = useBorrow ? this.getFlagBit(0) : 0; // Get borrow before calculation
    let result = a - b - borrowIn;

    if (updateCarry) {
      this.setFlagBit(result < 0, 0); // Carry flag (borrow)
    }
    this.setFlagBit((a & 0x0f) - (b & 0x0f) - borrowIn < 0, 4); // Auxiliary carry
    this.updateFlags(result & 0xff);

    return this.fb(result & 0xff);
  }

  setFlagBit(value: boolean, bit: number): void {
    if (bit < 0 || bit > 7) {
      throw new Error("Bit index out of bounds");
    }
    if (value) {
      this.registers.FLAG |= 1 << bit;
    } else {
      this.registers.FLAG &= ~(1 << bit);
    }
  }

  getFlagBit(bit: number): number {
    if (bit < 0 || bit > 7) {
      throw new Error("Bit index out of bounds");
    }
    return (this.registers.FLAG & (1 << bit)) !== 0 ? 1 : 0;
  }

  private updateFlags(value: number): void {
    this.setFlagBit(value === 0, 6);
    this.setFlagBit((value & 0x80) !== 0, 7);
    this.setFlagBit(this.isParity(value), 2);
  }

  isParity(value: number): boolean {
    let count = 0;
    for (let i = 0; i < 8; i++) {
      if ((value & (1 << i)) !== 0) {
        count++;
      }
    }
    return count % 2 === 0;
  }

  private handleJumpInstruction(instruction: string): void {
    const jumpAddress = this.concat2Bytes(
      this.memory[this.registers.PC + 2],
      this.memory[this.registers.PC + 1]
    );

    let shouldJump = false;

    switch (instruction) {
      case "JMP":
        shouldJump = true;
        break;
      case "JC":
        shouldJump = this.getFlagBit(0) === 1; // Carry flag
        break;
      case "JNC":
        shouldJump = this.getFlagBit(0) === 0;
        break;
      case "JP":
        shouldJump = this.getFlagBit(7) === 0; // Sign flag
        break;
      case "JM":
        shouldJump = this.getFlagBit(7) === 1;
        break;
      case "JZ":
        shouldJump = this.getFlagBit(6) === 1; // Zero flag
        break;
      case "JNZ":
        shouldJump = this.getFlagBit(6) === 0;
        break;
      case "JPE":
        shouldJump = this.getFlagBit(2) === 1; // Parity flag
        break;
      case "JPO":
        shouldJump = this.getFlagBit(2) === 0;
        break;
    }

    if (shouldJump) {
      this.registers.PC = jumpAddress - 1;
    } else {
      this.registers.PC += 2;
    }
  }

  private handleCallInstruction(instruction: string): void {
    const callAddress = this.concat2Bytes(
      this.memory[this.registers.PC + 2],
      this.memory[this.registers.PC + 1]
    );

    let shouldCall = false;

    switch (instruction) {
      case "CALL":
        shouldCall = true;
        break;
      case "CC":
        shouldCall = this.getFlagBit(0) === 1; // Carry flag
        break;
      case "CNC":
        shouldCall = this.getFlagBit(0) === 0;
        break;
      case "CP":
        shouldCall = this.getFlagBit(7) === 0; // Sign flag
        break;
      case "CM":
        shouldCall = this.getFlagBit(7) === 1;
        break;
      case "CZ":
        shouldCall = this.getFlagBit(6) === 1; // Zero flag
        break;
      case "CNZ":
        shouldCall = this.getFlagBit(6) === 0;
        break;
      case "CPE":
        shouldCall = this.getFlagBit(2) === 1; // Parity flag
        break;
      case "CPO":
        shouldCall = this.getFlagBit(2) === 0;
        break;
    }

    if (shouldCall) {
      this.pushToStack(this.registers.PC + 3);
      this.registers.PC = callAddress - 1;
    } else {
      this.registers.PC += 2;
    }
  }

  private handleReturnInstruction(instruction: string): void {
    const returnAddress = this.popFromStack();

    let shouldReturn = false;

    switch (instruction) {
      case "RET":
        shouldReturn = true;
        break;
      case "RC":
        shouldReturn = this.getFlagBit(0) === 1;
        break;
      case "RNC":
        shouldReturn = this.getFlagBit(0) === 0;
        break;
      case "RP":
        shouldReturn = this.getFlagBit(7) === 0;
        break;
      case "RM":
        shouldReturn = this.getFlagBit(7) === 1;
        break;
      case "RZ":
        shouldReturn = this.getFlagBit(6) === 1;
        break;
      case "RNZ":
        shouldReturn = this.getFlagBit(6) === 0;
        break;
      case "RPE":
        shouldReturn = this.getFlagBit(2) === 1;
        break;
      case "RPO":
        shouldReturn = this.getFlagBit(2) === 0;
        break;
    }

    if (shouldReturn) {
      this.registers.PC = returnAddress - 1;
    }
  }

  private pushToStack(value: number): void {
    this.registers.SP = (this.registers.SP - 2) & 0xffff;
    this.setAddressValue(this.registers.SP + 1, (value >> 8) & 0xff);
    this.setAddressValue(this.registers.SP, value & 0xff);
  }

  private popFromStack(): number {
    const value = this.concat2Bytes(
      this.getAddressValue(this.registers.SP + 1),
      this.getAddressValue(this.registers.SP)
    );
    this.registers.SP = (this.registers.SP + 2) & 0xffff;
    return value;
  }
}
