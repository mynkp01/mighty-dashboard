export const ScreenLoader = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="h-16 w-16 animate-spin rounded-full border-t-4 border-solid border-blue-300" />
    </div>
  );
};
