import { useState } from "preact/hooks";
import EditorPanel from "./components/editor-panel";
import RightPanel from "./components/right-panel";
import { CPU8085 } from "./lib/8085";

export function App() {
  const [cpu] = useState(new CPU8085());
  const [, forceRerender] = useState({});

  const triggerAppRerender = () => {
    forceRerender({});
  };

  return (
    <div className="h-dvh bg-gray-100 flex flex-col">
      <div className="flex flex-row gap-4 p-4 flex-1 overflow-hidden w-5xl mx-auto">
        {/* Editor Panel */}
        <div className="flex-1">
          <EditorPanel cpu={cpu} triggerRerender={triggerAppRerender} />
        </div>

        {/* Right Panel */}
        <div className="w-[40%]">
          <RightPanel cpu={cpu} triggerRerender={triggerAppRerender} />
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-800 text-white px-4 py-2">
        <p className="text-sm">
          Created by Savan Bhanderi • Inspired by Jubin Mitra
        </p>
      </div>
    </div>
  );
}
