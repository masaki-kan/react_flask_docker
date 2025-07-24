import { FC, useCallback, useEffect, useState } from "react";
import ProfileIndex from "./profileIndex";
import ProfileForm from "./profileForm";
import { VStack } from "@chakra-ui/react";

import useMyProfile from "../../hooks/useProfile";
import { postStoreProfileApi } from "../../api/profileApis";
import { profileType } from "../../types/profileType";
import useAlert from "../../hooks/useAlert";
import useLoading from "../../hooks/useLaoding";
import FullScreenSpinner from "../common/spliner/FullScreenSpinner";

const Profile: FC = () => {
  const { getMyProfile } = useMyProfile();
  const { defaultToast } = useAlert();
  const { changeLoading, memorizeLoading } = useLoading();
  const [editSwitch, setEditSwitch] = useState<boolean>(false);

  const editFormSwitchHandler = useCallback(() => {
    setEditSwitch((prev) => !prev);
  }, []);

  const formStoreEventHandler = useCallback(
    async (formdata: profileType) => {
      changeLoading(true);
      const response = await postStoreProfileApi(formdata);
      changeLoading(false);
      if (response?.status !== false) {
        defaultToast(response?.message);
        setEditSwitch(false);
      }
    },
    [changeLoading, defaultToast]
  );

  useEffect(() => {
    if (editSwitch !== true) {
      getMyProfile();
    }
  }, [editSwitch, getMyProfile]);

  return (
    <VStack align={"start"} gap={9} w={"100%"} mt={{ base: "8em", md: "6em" }}>
      {memorizeLoading && <FullScreenSpinner />}
      {editSwitch ? (
        <ProfileForm
          formStoreEvent={formStoreEventHandler}
          onClickFormSwitch={editFormSwitchHandler}
        />
      ) : (
        <ProfileIndex editFormSwitch={editFormSwitchHandler} />
      )}
    </VStack>
  );
};

export default Profile;
