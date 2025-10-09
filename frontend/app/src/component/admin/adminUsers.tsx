import { FC, useEffect } from "react";
import { getUsersDataApi } from "../../api/admin";

const AdminUsers: FC = () => {
  useEffect(() => {
    getUsersDataApi();
  }, []);
  return <></>;
};

export default AdminUsers;
