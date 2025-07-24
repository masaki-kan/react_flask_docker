import { FC } from "react";
import Select, { GroupBase, SingleValue, StylesConfig } from "react-select";
import { itemParts } from "../../../consts/itemConsts";
import makeAnimated from "react-select/animated";

const animatedComponents = makeAnimated();

// itemParts の型に合わせて調整
type ItemPartType = {
  key: number;
  name: string;
};

type CustomTypeSelectProps = {
  value: string | number;
  onChange: (value: string) => void;
  isInvalid?: boolean;
};

const CustomTypeSelect: FC<CustomTypeSelectProps> = ({
  value,
  onChange,
  isInvalid = false,
}) => {
  // optionの型を number として定義
  type OptionType = {
    value: number;
    label: string;
  };

  const options: OptionType[] = itemParts.map((part: ItemPartType) => ({
    value: part.key,
    label: part.name,
  }));

  // valueを数値に変換して比較
  const numericValue = typeof value === "string" ? parseInt(value, 10) : value;
  const selectedValue = value
    ? options.find((option) => option.value === numericValue) || null
    : null;

  const handleChange = (newValue: SingleValue<OptionType>) => {
    // 数値を文字列として返す
    onChange(newValue ? newValue.value.toString() : "");
  };

  // カスタムスタイル（完全型付け）
  const customStyles: StylesConfig<OptionType, false, GroupBase<OptionType>> = {
    control: (provided, state) => ({
      ...provided,
      minHeight: "40px",
      borderRadius: "0.375rem",
      borderColor: isInvalid
        ? "#E53E3E"
        : state.isFocused
          ? "#3182ce"
          : "#E2E8F0",
      boxShadow: state.isFocused ? "0 0 0 1px #3182ce" : "none",
      backgroundColor: "white",
      "&:hover": {
        borderColor: isInvalid ? "#E53E3E" : "#CBD5E0",
      },
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
      boxShadow:
        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    }),
    menuList: (provided) => ({
      ...provided,
      maxHeight: "200px",
      padding: "0",
    }),
    menuPortal: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#3182ce"
        : state.isFocused
          ? "#e6f2ff"
          : "white",
      color: state.isSelected ? "white" : "black",
      padding: "8px 12px",
      cursor: "pointer",
      "&:active": {
        backgroundColor: "#2c5282",
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#a0aec0",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#2d3748",
    }),
    indicatorSeparator: (provided) => ({
      ...provided,
      display: "none",
    }),
    dropdownIndicator: (provided, state) => ({
      ...provided,
      color: state.isFocused ? "#3182ce" : "#a0aec0",
      "&:hover": {
        color: "#3182ce",
      },
    }),
  };

  return (
    <Select
      menuPortalTarget={document.body} // これを追加
      menuPosition="fixed" // これも追加
      isMulti={false}
      components={animatedComponents}
      options={options}
      className="basic-multi-select"
      classNamePrefix="select"
      onChange={handleChange}
      placeholder="タイプを選択してください"
      value={selectedValue}
      styles={customStyles}
      menuPlacement="auto"
      noOptionsMessage={() => "選択肢がありません"}
    />
  );
};

export default CustomTypeSelect;
