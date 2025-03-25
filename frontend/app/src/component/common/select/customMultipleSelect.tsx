import { FC, KeyboardEvent } from "react";
import Select, { MultiValue } from "react-select";
import makeAnimated from "react-select/animated";
import { genres } from "../../../consts/profileGenreConsts";

const animatedComponents = makeAnimated();

type CustoMultipleSelectProps = {
  tags: { tagKey: string; tagName: string }[];
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onChange: (newTags: { tagKey: string; tagName: string }[]) => void; // 型を更新
};
const CustoMultipleSelect: FC<CustoMultipleSelectProps> = ({
  tags,
  // onKeyDown,
  onChange,
}) => {
  const options = genres.map((genre) => ({
    value: genre.brandKey.toString(),
    label: genre.brandName,
  }));
  const optionTags = tags.map((genre) => ({
    value: genre.tagKey,
    label: genre.tagName,
  }));

  const handleInputChange = (
    newValue: MultiValue<{
      value: string;
      label: string;
    }>
  ) => {
    const newTags = newValue.map((tag) => {
      return { tagKey: tag.value, tagName: tag.label };
    });

    onChange(newTags); // newValueをvalueの配列に変換してから渡す
  };

  return (
    <Select
      components={animatedComponents}
      isMulti
      options={options}
      className="basic-multi-select"
      classNamePrefix="select"
      // onKeyDown={onKeyDown}
      onChange={handleInputChange}
      placeholder="Select genres"
      isClearable
      value={optionTags}
    />
  );
};

export default CustoMultipleSelect;
