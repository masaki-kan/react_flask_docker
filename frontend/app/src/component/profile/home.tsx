import { FC, useCallback, useState, useEffect } from "react";
import ProfileIndex from "./profileIndex";
import ProfileForm from "./profileForm";
import useMyProfile from "../../hooks/useProfile";
import { postStoreProfileApi } from "../../api/profileApis";
import { profileType } from "../../types/profileType";
import useAlert from "../../hooks/useAlert";
import { Box } from "@chakra-ui/react";

const Profile: FC = () => {
  const { getMyProfile } = useMyProfile();
  const { defaultToast } = useAlert();
  const [editSwitch, setEditSwitch] = useState<boolean>(false);

  const editFormSwitchHandler = useCallback(() => {
    setEditSwitch((prev) => !prev);
  }, []);

  const formStoreEventHandler = useCallback(
    async (formdata: profileType) => {
      const response = await postStoreProfileApi(formdata);
      if (response?.status !== false) {
        defaultToast(response?.message);
        setEditSwitch(false);
      }
    },
    [defaultToast]
  );

  useEffect(() => {
    getMyProfile();
  }, [getMyProfile]);

  return (
    <>
      <Box mt={4}>
        {editSwitch ? (
          <ProfileForm
            formStoreEvent={formStoreEventHandler}
            onClickFormSwitch={editFormSwitchHandler}
          />
        ) : (
          <ProfileIndex editFormSwitch={editFormSwitchHandler} />
        )}
      </Box>
    </>
  );
};

export default Profile;
