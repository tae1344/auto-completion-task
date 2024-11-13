import Option from '../entity/Option';
import React, { useEffect, useRef } from 'react';
import '../styles/select-style.css';

interface PropsType {
  options: Option[] | null;
  open: boolean;
  focusedIndex: number | null;
  onSelect?: (option: Option, index: number) => void;
}

export default function OptionList({ options, open, onSelect, focusedIndex }: PropsType) {
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (focusedIndex !== null && optionRefs.current[focusedIndex]) {
      optionRefs.current[focusedIndex]?.scrollIntoView({
        behavior: 'auto',
        block: 'nearest',
      });
    }
  }, [open, focusedIndex]);

  const handleClickOption = (option: Option, index: number) => {
    onSelect?.(option, index);
  };

  return open ? (
    <div className={'option-container'} onKeyDown={() => console.log('onKeyDown')}>
      {options?.map((option: Option, index: number) => {
        return (
          <div
            key={index}
            ref={(ref) => (optionRefs.current[index] = ref)}
            className={`option-item ${focusedIndex === index ? 'focused' : ''}`}
            onClick={() => handleClickOption(option, index)}
          >
            <span>{option.label}</span>
          </div>
        );
      })}
    </div>
  ) : null;
}
