import { FC, KeyboardEvent } from "react";
import Select, { SingleValue } from "react-select";
import makeAnimated from "react-select/animated";
import { brandList } from "../../../consts/brandListi";

const animatedComponents = makeAnimated();

type CustomBrandSelectProps = {
  tags: { key: string; name: string };
  onChange: (newTags: { key: string; name: string }) => void; // 型を更新
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
};
const CustomBrandSelect: FC<CustomBrandSelectProps> = ({
  tags,
  // onKeyDown,
  onChange,
}) => {
  const options = brandList.map((brand) => ({
    value: brand.key.toString(),
    label: brand.name,
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
      onChange={handleInputChange}
      placeholder="ブランドを選択してください"
      value={value}
      menuPlacement="auto"
      noOptionsMessage={() => "選択肢がありません"}
    />
  );
};

export default CustomBrandSelect;
