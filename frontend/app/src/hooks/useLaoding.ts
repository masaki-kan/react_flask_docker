type useLoadingReturn = {
  loading: boolean;
};

const useLoading = (): useLoadingReturn => {
  return {
    loading: false,
  };
};

export default useLoading;
