import { FC, useCallback, useEffect, useState } from "react";
import ProfileIndex from "./profileIndex";
import ProfileForm from "./profileForm";
import { Icon, Stack, Tooltip, VStack } from "@chakra-ui/react";
import { CiEdit } from "react-icons/ci";
import useMyProfile from "../../hooks/useProfile";

import LogOut from "../common/layout/logOut";

const Profile: FC = () => {
  const { memorizeProfile, getMyProfile } = useMyProfile();
  const [editSwitch, setEditSwitch] = useState<boolean>(false);

  const editFormSwitchHandler = useCallback(() => {
    setEditSwitch((prev) => !prev);
  }, []);

  useEffect(() => {
    getMyProfile();
  }, []);

  return (
    <VStack align={"start"} gap={9} w={"100%"}>
      <Stack align={"end"} width={"full"}>
        <Tooltip label={"プロフィール編集"}>
          <Icon as={CiEdit} w={8} h={8} onClick={editFormSwitchHandler} />
        </Tooltip>
      </Stack>

      {editSwitch ? (
        <ProfileForm
          profileData={memorizeProfile.profile}
          formSwitchEvent={editFormSwitchHandler}
        />
      ) : (
        <>
          <ProfileIndex />
          <LogOut />
        </>
      )}
    </VStack>
  );
};

export default Profile;
