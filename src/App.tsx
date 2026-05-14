import { useState, useRef, useEffect } from "react";
import Toggle from "./components/Toggle";

function App() {
  // State variables for trimming and cropping
  const [trimEnabled, setTrimEnabled] = useState(false);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(100);
  const [cropEnabled, setCropEnabled] = useState(false);
  const [cropX, setCropX] = useState(25);
  const [cropY, setCropY] = useState(25);
  const [cropWidth, setCropWidth] = useState(50);
  const [cropHeight, setCropHeight] = useState(50);

  // Video file state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoUrlRef = useRef<string | null>(null);

  // Handle video upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);

      // Create a new URL for the uploaded file
      if (videoUrlRef.current) {
        URL.revokeObjectURL(videoUrlRef.current);
      }
      const url = URL.createObjectURL(e.target.files[0]);
      videoUrlRef.current = url;
    }
  };

  // Reset all editing parameters
  const resetEditor = () => {
    setTrimStart(0);
    setTrimEnd(100);
    setCropX(0);
    setCropY(0);
    setCropWidth(100);
    setCropHeight(100);
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (videoUrlRef.current) {
        URL.revokeObjectURL(videoUrlRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen text-white p-6 max-w-screen-lg w-full mx-auto flex flex-col gap-8">
      {/* Video Upload */}
      <div className=" ">
        <label className="block mb-2.5 text-sm font-medium text-heading">
          Upload Video
        </label>
        <input
          type="file"
          accept="video/*"
          onChange={handleVideoUpload}
          className="mx-auto cursor-pointer block text-sm text-center file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-gray-700 file:text-sm file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-600 "
        />
      </div>

      {/* Preview Area */}
      {videoFile ? (
        <div className=" bg-gray-800 rounded-lg border-2 border-dashed border-gray-700">
          <div className="relative bg-black rounded-lg overflow-hidden ">
            <video
              ref={videoRef}
              src={videoUrlRef.current || ""}
              controls
              className="w-full max-h-auto border-0 cursor-pointer"
              onLoadedMetadata={(e) => {
                (e.target as HTMLVideoElement).volume = 0.1;
              }} // set default volume to 10%
            />

            {/* Crop overlay */}
            {cropEnabled && (
              <div
                className="crop-overlay absolute inset-0 pointer-events-none border-2 border-dashed border-blue-400"
                style={{
                  left: `${cropX}%`,
                  top: `${cropY}%`,
                  width: `${cropWidth}%`,
                  height: `${cropHeight}%`,
                }}
              >
                <div className="absolute left-0 right-0 text-blue-400 font-bold h-full w-full flex items-center justify-center">
                  Crop Area
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 border-2 border-dashed border-gray-700 rounded-lg h-64 flex items-center justify-center">
          <p className="text-gray-400">No video uploaded yet</p>
        </div>
      )}

      {/* Trim Controls */}
      <div className=" bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div
          className={`flex items-center justify-between ${trimEnabled && "mb-4"}`}
        >
          <h2 className="text-xl font-semibold">Trim</h2>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={trimEnabled}
              onChange={(e) => setTrimEnabled(e.target.checked)}
              className="sr-only"
            />
            <Toggle dependency={trimEnabled} />
          </label>
        </div>

        {trimEnabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Start: {trimStart}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={trimStart}
                onChange={(e) => setTrimStart(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">End: {trimEnd}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={trimEnd}
                onChange={(e) => setTrimEnd(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Crop Toggle */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div
          className={`flex items-center justify-between ${cropEnabled && "mb-4"}`}
        >
          <h2 className="text-xl font-semibold">Crop</h2>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={cropEnabled}
              onChange={(e) => setCropEnabled(e.target.checked)}
              className="sr-only"
            />
            <Toggle dependency={cropEnabled} />
          </label>
        </div>

        {/* Crop Sliders */}
        {cropEnabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">X Position: {cropX}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={cropX}
                onChange={(e) => setCropX(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Y Position: {cropY}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={cropY}
                onChange={(e) => setCropY(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Width: {cropWidth}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={cropWidth}
                onChange={(e) => setCropWidth(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">
                Height: {cropHeight}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={cropHeight}
                onChange={(e) => setCropHeight(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={resetEditor}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
        >
          Reset All
        </button>

        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-md transition-colors disabled:opacity-50">
          Export Video
        </button>
      </div>
    </div>
  );
}

export default App;
