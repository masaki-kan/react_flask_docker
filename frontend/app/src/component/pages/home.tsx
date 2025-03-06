import { useState, type FC } from "react";
import axios from "axios";

const Home: FC = () => {
  const [count, setCount] = useState(0);
  const [data, setData] = useState<string>("");

  const fetchData = async () => {
    const result = await axios.get("http://localhost:5001");
    setData(result.data);
  };

  return (
    <>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
      <button onClick={fetchData}>Push</button>
      <p>{data}</p>
    </>
  );
};

export default Home;
