import { FC, KeyboardEvent } from "react";
import Select, { SingleValue } from "react-select";
import makeAnimated from "react-select/animated";
import { genres } from "../../../consts/profileGenreConsts";

const animatedComponents = makeAnimated();

type CustomSelectProps = {
  tags: { key: string; name: string };
  onChange: (newTags: { key: string; name: string }) => void; // 型を更新
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
  const value = { value: tags.key, label: tags.name };

  const handleInputChange = (
    newValue: SingleValue<{ value: string; label: string }>
  ) => {
    if (newValue) {
      const newTag = { key: newValue.value, name: newValue.label };
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
