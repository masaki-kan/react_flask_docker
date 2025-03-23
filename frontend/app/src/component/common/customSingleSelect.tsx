import { FC, KeyboardEvent } from "react";
import Select, { SingleValue } from "react-select";
import makeAnimated from "react-select/animated";
import { genres } from "../../consts/profileGenreConsts";

const animatedComponents = makeAnimated();

type CustomSelectProps = {
  tags: { tagKey: string; tagName: string };
  onChange: (newTags: { tagKey: string; tagName: string }) => void; // 型を更新
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
};
const CustomSingleSelect: FC<CustomSelectProps> = ({
  tags,
  // onKeyDown,
  onChange,
}) => {
  const options = genres.map((genre) => ({
    value: genre.brandKey.toString(),
    label: genre.brandName,
  }));
  const value = { value: tags.tagKey, label: tags.tagName };

  const handleInputChange = (
    newValue: SingleValue<{ value: string; label: string }>
  ) => {
    if (newValue) {
      const newTag = { tagKey: newValue.value, tagName: newValue.label };
      onChange(newTag);
    }
  };

  return (
    <Select
      isMulti={false}
      components={animatedComponents}
      options={options}
      className="basic-multi-select"
      classNamePrefix="select"
      // onKeyDown={onKeyDown}
      onChange={handleInputChange}
      placeholder="Select genres"
      value={value}
    />
  );
};

export default CustomSingleSelect;
