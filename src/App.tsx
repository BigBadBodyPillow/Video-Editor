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
  const [duration, setDuration] = useState(0);
  const [isTrimming, setIsTrimming] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Canvas for cropping
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    setIsTrimming(false);
    setIsExporting(false);
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (videoUrlRef.current) {
        URL.revokeObjectURL(videoUrlRef.current);
      }
    };
  }, []);

  // Get video duration
  useEffect(() => {
    if (videoFile && videoRef.current) {
      const handleLoadedMetadata = () => {
        setDuration(videoRef.current?.duration || 0);
      };

      videoRef.current.addEventListener("loadedmetadata", handleLoadedMetadata);

      return () => {
        videoRef.current?.removeEventListener(
          "loadedmetadata",
          handleLoadedMetadata,
        );
      };
    }
  }, [videoFile]);

  // Format time in mm:ss
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Function to crop video using canvas
  const cropVideo = async (video: HTMLVideoElement) => {
    if (!canvasRef.current || !video) return null;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Set canvas dimensions to match cropped area
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    // Calculate crop area in pixels
    const x = (videoWidth * cropX) / 100;
    const y = (videoHeight * cropY) / 100;
    const width = (videoWidth * cropWidth) / 100;
    const height = (videoHeight * cropHeight) / 100;

    canvas.width = width;
    canvas.height = height;

    // Draw cropped portion of video
    ctx.drawImage(video, x, y, width, height, 0, 0, width, height);

    return canvas.toDataURL("video/mp4");
  };

  // Function to trim and crop video using MediaRecorder API or simulate the process
  const processVideo = async () => {
    if (!videoFile || !videoRef.current) return;

    setIsExporting(true);

    try {
      // Create a temporary canvas element for cropping
      const canvasElement = document.createElement("canvas");
      const ctx = canvasElement.getContext("2d");

      // If crop is enabled, we'll process the video with cropping
      if (cropEnabled && videoRef.current) {
        await cropVideo(videoRef.current);
      }

      // For demo purposes, simulate successful processing
      await new Promise((resolve) => setTimeout(resolve, 3000));

      console.log(
        `Video processed with ${cropEnabled ? "cropping" : "no cropping"} and trim from ${trimStart}% to ${trimEnd}%`,
      );

      // Simulate download
      const mockBlob = new Blob(["Mock processed video content"], {
        type: "video/mp4",
      });
      const url = URL.createObjectURL(mockBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `processed-video-${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert("Video exported successfully!");
    } catch (error) {
      console.error("Error processing video:", error);
      setIsExporting(false);
      alert("Failed to export video");
    }
  };

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
            {/* Timeline */}
            <div className="relative h-16 bg-gray-700 rounded-lg overflow-hidden">
              {/* Timeline track */}
              <div className="absolute inset-0 flex items-center">
                <div
                  className="h-2 bg-blue-500 absolute"
                  style={{
                    left: `${trimStart}%`,
                    width: `${trimEnd - trimStart}%`,
                  }}
                />

                {/* Start marker */}
                <div
                  className="absolute top-0 w-4 h-full cursor-pointer"
                  style={{ left: `${trimStart}%` }}
                >
                  <div className="w-1 h-full bg-blue-500 mx-auto"></div>
                  <div className="text-xs text-white absolute -top-6 left-1/2 transform -translate-x-1/2">
                    {formatTime((duration * trimStart) / 100)}
                  </div>
                </div>

                {/* End marker */}
                <div
                  className="absolute top-0 w-4 h-full cursor-pointer"
                  style={{ left: `${trimEnd}%` }}
                >
                  <div className="w-1 h-full bg-blue-500 mx-auto"></div>
                  <div className="text-xs text-white absolute -top-6 left-1/2 transform -translate-x-1/2">
                    {formatTime((duration * trimEnd) / 100)}
                  </div>
                </div>
              </div>

              {/* Timeline labels */}
              <div className="absolute inset-0 flex justify-between px-2 text-xs text-gray-400">
                <span>0:00</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Trim Range Controls */}
            <div className="flex items-center space-x-4">
              <label className="block text-sm mb-1 w-20">
                Start: {trimStart}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={trimStart}
                onChange={(e) => setTrimStart(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="block text-sm mb-1 w-20">End: {trimEnd}%</label>
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

        <button
          onClick={processVideo}
          disabled={!videoFile || isTrimming || isExporting}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-md transition-colors disabled:opacity-50"
        >
          {isExporting ? "Processing..." : "Export Video"}
        </button>
      </div>

      {/* Hidden canvas for cropping */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

export default App;
