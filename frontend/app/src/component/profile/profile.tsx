import { FC, useCallback, useEffect, useState } from "react";
import ProfileIndex from "./profileIndex";
import ProfileForm from "./profileForm";
import { Icon, Stack, Tooltip, VStack } from "@chakra-ui/react";
import { CiEdit } from "react-icons/ci";
import useMyProfile from "../../hooks/useMyProfile";

const Profile: FC = () => {
  const { memorizeProfile, getMyProfile } = useMyProfile();
  const [editSwitch, setEditSwitch] = useState<boolean>(false);

  const editFormSwitchHandler = useCallback(() => {
    setEditSwitch((prev) => !prev);
  }, []);

  useEffect(() => {
    getMyProfile();
  }, [getMyProfile]);

  return (
    <VStack
      align={"start"}
      ml={{ base: 0, md: 8 }}
      gap={9}
      w={{ base: "100%", md: "50%" }}
    >
      <Stack align={"end"} width={"full"}>
        <Tooltip label={"編集"}>
          <Icon as={CiEdit} w={8} h={8} onClick={editFormSwitchHandler} />
        </Tooltip>
      </Stack>
      {editSwitch ? (
        <ProfileForm
          profileData={memorizeProfile}
          formSwitchEvent={editFormSwitchHandler}
        />
      ) : (
        <ProfileIndex profileData={memorizeProfile} />
      )}
    </VStack>
  );
};

export default Profile;
