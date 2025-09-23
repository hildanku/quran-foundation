export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50 bg-opacity-80">
      <div className="flex flex-col items-center space-y-3">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
        <p className="text-xs text-gray-500">Loading</p>
      </div>
    </div>
  )
}
