import { type FC } from "preact/compat";
import { useState } from "preact/hooks";

const NumberConverter: FC = () => {
  const [hexValue, setHexValue] = useState("");
  const [decValue, setDecValue] = useState("");
  const [binValue, setBinValue] = useState("");

  const updateValues = (value: string, type: "hex" | "dec" | "bin") => {
    let num = 0;

    try {
      switch (type) {
        case "hex":
          num = parseInt(value || "0", 16);
          setHexValue(value);
          setDecValue(num.toString());
          setBinValue(num.toString(2));
          break;
        case "dec":
          num = parseInt(value || "0", 10);
          setDecValue(value);
          setHexValue(num.toString(16).toUpperCase());
          setBinValue(num.toString(2));
          break;
        case "bin":
          num = parseInt(value || "0", 2);
          setBinValue(value);
          setHexValue(num.toString(16).toUpperCase());
          setDecValue(num.toString());
          break;
      }
    } catch (error) {
      // Handle invalid input gracefully
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-100 px-3 py-2 border-b border-gray-200">
        <h3 className="text-sm font-medium text-blue-600">
          No. Converter Tool :
        </h3>
      </div>
      <div className="p-3">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Hexadecimal
            </label>
            <input
              type="text"
              value={hexValue}
              onChange={(e) =>
                updateValues((e.target as HTMLInputElement).value, "hex")
              }
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Decimal
            </label>
            <input
              type="text"
              value={decValue}
              onChange={(e) =>
                updateValues((e.target as HTMLInputElement).value, "dec")
              }
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Binary
            </label>
            <input
              type="text"
              value={binValue}
              onChange={(e) =>
                updateValues((e.target as HTMLInputElement).value, "bin")
              }
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              placeholder="0"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NumberConverter;
