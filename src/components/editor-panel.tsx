import { type FC } from "preact/compat";
import { useState } from "preact/hooks";
import AssemblerView, { type AssemblyInstruction } from "./assemble-view";
import { assembler } from "../lib/assembler";
import { CPU8085 } from "../lib/8085";

const EditorPanel: FC<{
  cpu: CPU8085;
  triggerRerender: () => void;
}> = ({ cpu, triggerRerender }) => {
  const [activeTab, setActiveTab] = useState("editor");
  const [code, setCode] = useState("");
  const [assemblyInstructions, setAssemblyInstructions] = useState<
    AssemblyInstruction[]
  >([]);

  const onAssemble = () => {
    const assembledCode = assembler(code);
    setAssemblyInstructions(assembledCode.assemblyInstructions);
    console.log("Assembly Instructions:", assembledCode.assemblyInstructions);
    setActiveTab("assembler");
    cpu.reset();
    cpu.loadProgram(assembledCode.instructions);
    triggerRerender();
    console.log("CPU State after assembly:", cpu);
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-sm h-full flex flex-col">
      <div className="bg-gray-100 px-4 py-3 border-b border-gray-300 rounded-t-lg">
        <h2 className="text-lg font-semibold text-gray-800">
          Intel 8085 Simulator
        </h2>
      </div>

      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("editor")}
          className={`px-6 py-2 text-sm font-medium ${
            activeTab === "editor"
              ? "bg-white text-blue-600 border-b-2 border-blue-600"
              : "bg-gray-50 text-gray-600 hover:text-gray-800"
          }`}
        >
          Editor
        </button>
        <button
          onClick={() => setActiveTab("assembler")}
          className={`px-6 py-2 text-sm font-medium ${
            activeTab === "assembler"
              ? "bg-white text-blue-600 border-b-2 border-blue-600"
              : "bg-gray-50 text-gray-600 hover:text-gray-800"
          }`}
        >
          Assembler
        </button>
      </div>

      {activeTab === "editor" ? (
        <>
          <div className="flex-1 p-4">
            <textarea
              value={code}
              onChange={(e) => setCode((e.target as HTMLTextAreaElement).value)}
              className="w-full h-full resize-none border border-gray-200 rounded-md p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your assembly code here..."
            />
          </div>

          <div className="flex justify-between items-center p-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <button className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors">
              Autocorrect
            </button>
            <button
              className="px-6 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              onClick={onAssemble}
            >
              Assemble
            </button>
          </div>
        </>
      ) : (
        <div className="flex-1 p-4">
          <AssemblerView
            instructions={assemblyInstructions}
            cpu={cpu}
            triggerRerender={triggerRerender}
          />
        </div>
      )}
    </div>
  );
};

export default EditorPanel;
