type Props = {
  dependency: boolean;
};

export default function Toggle({ dependency }: Props) {
  return (
    <div
      className={`w-10 h-6 rounded-md ${dependency ? "bg-blue-600" : "bg-gray-600"} transition-colors`}
    >
      <div
        className={`absolute w-4 h-4.25 bg-white rounded-sm top-1 ${dependency ? "left-5" : "left-1"} transition-all duration-200`}
      ></div>
    </div>
  );
}
