import React, { FC } from "react";
import { VStack, Wrap, Tag } from "@chakra-ui/react";
import { tagType } from "../../types/listTye";

type RebderitemTagProps = {
  tagList: tagType[];
};

const RebderItemTag: FC<RebderitemTagProps> = React.memo(({ tagList }) => {
  return (
    <>
      <VStack align={"start"} mt={10}>
        <Wrap>
          {tagList.map((tag, index) => {
            return <Tag key={index}>{tag.name}</Tag>;
          })}
        </Wrap>
      </VStack>
    </>
  );
});

export default RebderItemTag;
