import { FC, useCallback, useState, useEffect } from "react";
import ProfileIndex from "./profileIndex";
import ProfileForm from "./profileForm";
import useMyProfile from "../../hooks/useProfile";
import { postStoreProfileApi } from "../../api/profileApis";
import { profileType } from "../../types/profileType";
import useAlert from "../../hooks/useAlert";

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
      if (response.success) {
        defaultToast(response.data.message);
        getMyProfile();
      }
    },
    [defaultToast, getMyProfile]
  );

  useEffect(() => {
    getMyProfile();
  }, [getMyProfile]);

  return (
    <>
      {editSwitch ? (
        <ProfileForm
          formStoreEvent={formStoreEventHandler}
          onClickFormSwitch={editFormSwitchHandler}
        />
      ) : (
        <ProfileIndex editFormSwitch={editFormSwitchHandler} />
      )}
    </>
  );
};

export default Profile;
