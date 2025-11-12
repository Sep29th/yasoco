type PropsType = {
  loading: boolean;
};

export function SubmitButton({ loading }: PropsType) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full cursor-pointer flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#A6CF52] hover:bg-[#95b847] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A6CF52] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {loading ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Đang đăng nhập...
        </div>
      ) : (
        "Đăng nhập"
      )}
    </button>
  );
}
