import { FC } from "react";
import Select, { MultiValue } from "react-select";
import makeAnimated from "react-select/animated";
import { genres } from "../../consts/profileConsts";

const animatedComponents = makeAnimated();

type CustoMultipleSelectProps = {
  tags: { key: string; name: string }[];
  onChange: (newTags: { key: string; name: string }[]) => void; // 型を更新
};
const CustoMultipleSelect: FC<CustoMultipleSelectProps> = ({
  tags,
  onChange,
}) => {
  const options = genres.map((genre) => ({
    value: genre.brandKey.toString(),
    label: genre.brandName,
  }));
  const optionTags = tags.map((genre) => ({
    value: genre.key,
    label: genre.name,
  }));

  const handleInputChange = (
    newValue: MultiValue<{
      value: string;
      label: string;
    }>
  ) => {
    const newTags = newValue.map((tag) => {
      return { key: tag.value, name: tag.label };
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
      name="tag"
      value={optionTags}
    />
  );
};

export default CustoMultipleSelect;
