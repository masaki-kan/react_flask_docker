import { FC, useCallback, useEffect, useState } from "react";
import ProfileIndex from "./profileIndex";
import ProfileForm from "./profileForm";
import { VStack } from "@chakra-ui/react";

import useMyProfile from "../../hooks/useProfile";
import { postStoreProfileApi } from "../../api/profileApis";
import { profileType } from "../../types/profile";
import { useDispatch } from "react-redux";
import { updateLoad } from "../../store/loadingSlice";
import useAlert from "../../hooks/useAlert";

const Profile: FC = () => {
  const { getMyProfile } = useMyProfile();
  const { sweetSuccessOverAlert } = useAlert();
  const [editSwitch, setEditSwitch] = useState<boolean>(false);

  const dispath = useDispatch();

  const editFormSwitchHandler = useCallback(() => {
    setEditSwitch((prev) => !prev);
  }, []);

  const formStoreEventHandler = useCallback(
    async (formdata: profileType) => {
      dispath(updateLoad(true));
      const response = await postStoreProfileApi(formdata);
      if (response?.status !== false) {
        dispath(updateLoad(false));
        sweetSuccessOverAlert().then((result) => {
          if (result.isConfirmed) {
            // OK 押下時の処理
            getMyProfile();
            setEditSwitch(false);
          }
        });
      }
    },
    [dispath, getMyProfile, sweetSuccessOverAlert]
  );

  useEffect(() => {
    if (editSwitch !== true) {
      getMyProfile();
    }
  }, []);

  return (
    <VStack align={"start"} gap={9} w={"100%"}>
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
