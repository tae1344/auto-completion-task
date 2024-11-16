import Option from '../entity/Option';
import React, { ForwardedRef, forwardRef, useCallback, useEffect, useRef } from 'react';
import '../styles/select-style.css';

interface PropsType {
  options: Option[];
  open: boolean;
  focusedIndex: number | null;
  onSelect?: (option: Option, index: number) => void;
}
const OptionList = forwardRef(({ options, open, onSelect, focusedIndex }: PropsType, ref: ForwardedRef<any>) => {
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (focusedIndex !== null && optionRefs.current[focusedIndex] instanceof HTMLElement) {
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
    <div ref={ref} className={'option-container'}>
      {options.length === 0 ? (
        <div className={`no-result`}>
          <span>{'검색 결과가 없어요.'}</span>
        </div>
      ) : (
        options?.map((option: Option, index: number) => {
          return (
            <div
              key={index}
              ref={(ref) => {
                optionRefs.current[index] = ref;
              }}
              className={`option-item ${focusedIndex === index ? 'focused' : ''}`}
              onClick={() => handleClickOption(option, index)}
            >
              <span>{option.label}</span>
            </div>
          );
        })
      )}
    </div>
  ) : null;
});

export default OptionList;
