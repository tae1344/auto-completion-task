import Option from '../entity/Option';
import React from 'react';
import '../styles/select-style.css';

interface PropsType {
  options: Option[] | null;
  open: boolean;
  focusedIndex: number | null;
  onSelect?: (option: Option) => void;
}

export default function OptionList({ options, open, onSelect, focusedIndex }: PropsType) {
  const handleClickOption = (option: Option) => {
    onSelect?.(option);
  };

  return open ? (
    <div className={'option-container'} onKeyDown={() => console.log('onKeyDown')}>
      {options?.map((option: Option, index: number) => {
        return (
          <div
            key={index}
            className={`option-item ${focusedIndex === index ? 'focused' : ''}`}
            onClick={() => handleClickOption(option)}
          >
            <span>{option.label}</span>
          </div>
        );
      })}
    </div>
  ) : null;
}
