import { FC } from "react";

type PagerComponentProps = {
  hasMore: boolean;
  dataLenght: number;
  handleLoadMore: () => void;
  loading: boolean;
};

const PagerComponent: FC<PagerComponentProps> = ({
  hasMore,
  dataLenght,
  handleLoadMore,
  loading,
}) => {
  return (
    <>
      {hasMore && dataLenght > 0 && (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button
            onClick={handleLoadMore}
            disabled={loading}
            style={{
              padding: "12px 30px",
              backgroundColor: loading ? "#ccc" : "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            {loading ? "読み込み中..." : "さらに100件読み込む"}
          </button>
        </div>
      )}
    </>
  );
};

export default PagerComponent;
