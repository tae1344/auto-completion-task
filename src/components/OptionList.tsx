import Option from '../entity/Option';
import React from 'react';
import '../styles/select-style.css';

interface PropsType {
  options: Option[] | null;
  open: boolean;
  onSelect?: (option: Option) => void;
}

export default function OptionList({ options, open, onSelect }: PropsType) {
  const handleClickOption = (option: Option) => {
    onSelect?.(option);
  };

  return open ? (
    <div className={`option-container`}>
      {options?.map((option: Option, index: number) => {
        return (
          <div key={index} className={'option-item'} onClick={() => handleClickOption(option)}>
            <span>{option.label}</span>
          </div>
        );
      })}
    </div>
  ) : null;
}
