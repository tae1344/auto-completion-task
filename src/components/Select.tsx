import React, {
  ChangeEvent,
  KeyboardEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import '../styles/select-style.css';
import Option from '../entity/Option';
import OptionList from './OptionList';
import useDebounce from '../hooks/useDebounce';

type Options = Array<Option>;

type SelectProps = {
  value?: string | null;
  options: Options | (() => Promise<Options>);
  onChange?: (value: string) => void;
};

/**
 * @description https://mui.com/material-ui/react-autocomplete/#combo-box 에서 Autocomplete > Combo를 참고해 아래의 기능을 구현하세요.
 * - `Select`의 폭은 선택 가능한 option들 중 가장 폭이 넓은 것에 맞춰져 있어야 합니다. 즉 어떤 option이라도 그것이 선택되었을 때, 잘린 채로 표시되어서는 안 됩니다.
 * - option을 검색할 수 있어야 합니다. option을 선택하지 않고, focus가 `Select`를 벗어난 경우에는, 검색어가 삭제되어야 합니다.
 * - 마우스 뿐 아니라 키보드를 사용해도 option을 선택할 수 있어야 합니다.
 * - `Select`를 클릭하거나 `Select`에서 위 방향 또는 아래 방향 키보드를 누르면 선택 가능한 option들이 나타나야 합니다.
 * - 클릭하거나 엔터키를 누르는 것으로 option을 선택할 수 있어야 합니다.
 * - 선택 가능한 option들이 나타날 때, 선택된 option이 있다면, 선택된 그 option이 보여야 하고, 강조되어야 하며, 키보드를 이용해 option을 순회할 때 선택된 option이 시작 지점이 되어야 합니다.
 * - 선택 가능한 option들이 나타날 때, option들이 스크린을 벗어나지 않아야 합니다. 예를 들어, `Select` 아래쪽에 선택 가능한 option들이 나타나기에 공간이 부족하다면, 선택 가능한 option들은 위쪽에 나타나야 합니다.
 * - `Select`가 hover 되는 경우와 focus 되는 경우, 그리고 두 경우가 아닌 경우에 대해 `Select`의 스타일이 달라야 합니다.
 */
function Select(props: SelectProps): React.ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);
  const optionListRef = useRef<HTMLDivElement>(null);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [searchValue, setSearchValue] = useState<string>('');
  const [resolvedOptions, setResolvedOptions] = useState<Options | null>(null);
  const [filteredOptions, setFilteredOptions] = useState<Options | null>(null);
  const [isOpenList, setIsOpenList] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null); // 현재 포커싱된 옵션의 인덱스
  const [isHover, setIsHover] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const getOptions = async () => {
      try {
        if (typeof props.options === 'function') {
          const result = await props.options();
          setResolvedOptions(result);
          setFilteredOptions(result);
        } else {
          setResolvedOptions(props.options);
          setFilteredOptions(props.options);
        }
      } catch (error) {
        setResolvedOptions([]);
        setFilteredOptions([]);
      }
    };

    getOptions();
  }, [props.options]);

  useEffect(() => {
    if (selectedOption === null && !isOpenList) {
      setFocusedIndex(null);
    }
  }, [isOpenList]);

  const adjustOptionListPosition = () => {
    if (isOpenList && optionListRef.current) {
      const rect = optionListRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const inputRect = inputRef.current?.getBoundingClientRect();

      if (rect.bottom > windowHeight && inputRect) {
        optionListRef.current.style.bottom = `${inputRect.height + 4}px`;
        optionListRef.current.style.top = 'auto';
      } else {
        optionListRef.current.style.top = `calc(100% + 4px)`;
        optionListRef.current.style.bottom = 'auto';
      }
    }
  };

  const debouncedAdjustOptionListPosition = useDebounce(adjustOptionListPosition, 200);

  useEffect(() => {
    adjustOptionListPosition();
    window.addEventListener('resize', debouncedAdjustOptionListPosition);

    return () => {
      window.removeEventListener('resize', debouncedAdjustOptionListPosition);
    };
  }, [isOpenList, filteredOptions, debouncedAdjustOptionListPosition]);

  const filter = (value: string) => {
    if (!resolvedOptions) return;

    if (value === '') {
      setFilteredOptions(resolvedOptions);
    } else {
      const filtered = resolvedOptions.filter((option) => option.label.toLowerCase().includes(value.toLowerCase()));
      setFilteredOptions(filtered);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const search = e.target.value;

    if (search === '') {
      setSelectedOption(null);
      setFocusedIndex(null);
    }

    setSearchValue(search);
    filter(search);
    setIsOpenList(true);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!filteredOptions) return;

    if (e.key === 'ArrowDown') {
      openOptionList();
      isOpenList &&
        setFocusedIndex((prevIndex) => {
          if (prevIndex === null || prevIndex >= filteredOptions.length - 1) {
            return 0;
          }

          return prevIndex + 1;
        });
    } else if (e.key === 'ArrowUp') {
      openOptionList();
      isOpenList &&
        setFocusedIndex((prevIndex) => {
          if (prevIndex === null || prevIndex <= 0) {
            return filteredOptions.length - 1;
          }

          return prevIndex - 1;
        });
    } else if (e.key === 'Enter') {
      if (focusedIndex !== null && filteredOptions[focusedIndex]) {
        handleSelectOption(filteredOptions[focusedIndex], focusedIndex);
      }
    }
  };

  const handleDeleteOption = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setSearchValue('');
    setSelectedOption(null);
    setFocusedIndex(null);
    inputRef.current?.focus();
  };

  const handleOpenList = () => {
    if (!isOpenList) {
      inputRef.current?.focus();
    }
    setIsOpenList(!isOpenList);
  };

  const handleSelectOption = (option: Option, index: number) => {
    setSearchValue(option.label);
    setSelectedOption(option);
    setFocusedIndex(index);
    closeOpenList();
    inputRef.current?.focus();
  };

  const openOptionList = () => {
    setIsOpenList(true);
    setIsFocused(true);
  };

  const closeOpenList = () => {
    setTimeout(() => {
      setIsOpenList(false);
      setFilteredOptions(resolvedOptions);
    }, 150);
  };

  const onBlur = () => {
    closeOpenList();
    setIsFocused(false);
    setIsHover(false);
    setSearchValue(selectedOption === null ? '' : selectedOption.label);
  };

  const onMouseEnter = () => {
    setIsHover(true);
  };

  const onMouseLeave = useCallback(() => {
    setIsHover(isFocused);
  }, [isFocused]);

  const onMouseDown = (e: MouseEvent) => {
    e.preventDefault();
  };

  const isShowClearButton = useMemo(() => {
    return searchValue.length > 0 && (isHover || isFocused);
  }, [isFocused, searchValue, isHover]);

  return (
    <div className={'select-container'} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <div className={`input-container ${isFocused ? 'focus' : ''}`}>
        <input
          ref={inputRef}
          className={'input-box'}
          value={searchValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={openOptionList}
          onBlur={onBlur}
        />
        <div className={'indicator-container'}>
          <button
            className={`indicator-button delete ${!isShowClearButton ? 'disable' : ''}`}
            onClick={handleDeleteOption}
            disabled={!isShowClearButton}
            onMouseDown={onMouseDown}
          >
            <img
              className={`${!isShowClearButton ? 'hide' : ''}`}
              src={require('../assets/close.png')}
              alt={'close icon'}
              width={10}
              height={10}
            />
          </button>
          <button className={'indicator-button trigger'} onClick={handleOpenList} onMouseDown={onMouseDown}>
            <img
              src={isOpenList ? require('../assets/arrow-up.png') : require('../assets/arrow-down.png')}
              alt={'arrow icon'}
              width={12}
              height={12}
              className={'trigger-icon'}
            />
          </button>
        </div>
      </div>

      <OptionList
        ref={optionListRef}
        options={filteredOptions}
        open={isOpenList}
        onSelect={handleSelectOption}
        focusedIndex={focusedIndex}
      />
    </div>
  );
}

export { Select };
