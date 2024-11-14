import React, { ChangeEvent, KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
import '../styles/select-style.css';
import Option from '../entity/Option';
import OptionList from './OptionList';

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
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [searchValue, setSearchValue] = useState<string>('');
  const [resolvedOptions, setResolvedOptions] = useState<Options | null>(null);
  const [filteredOptions, setFilteredOptions] = useState<Options | null>(null);
  const [isOpenList, setIsOpenList] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null); // 현재 포커싱된 옵션의 인덱스

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
      } finally {
      }
    };

    getOptions();
  }, [props.options]);

  useEffect(() => {
    if (selectedOption === null && !isOpenList) {
      setFocusedIndex(null);
    }
  }, [isOpenList]);

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
    setSearchValue(search);
    filter(search);
    setIsOpenList(true);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!filteredOptions) return;

    if (e.key === 'ArrowDown') {
      openOptionList();
      setFocusedIndex((prevIndex) => {
        if (prevIndex === null || prevIndex >= filteredOptions.length - 1) {
          return 0;
        }

        return prevIndex + 1;
      });
    } else if (e.key === 'ArrowUp') {
      openOptionList();
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

  const handleDeleteOption = () => {
    setSearchValue('');
    setSelectedOption(null);
    setFocusedIndex(null);
    inputRef.current?.focus();
  };

  const handleOpenList = () => {
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
    filter(searchValue);
    setIsOpenList(true);
  };

  const closeOpenList = () => {
    setTimeout(() => {
      setIsOpenList(false);
    }, 150);
  };

  const onBlur = () => {
    closeOpenList();
    setSearchValue(selectedOption === null ? '' : selectedOption.label);
  };

  return (
    <div className={'select-container'}>
      <input
        ref={inputRef}
        className={'input-box'}
        value={searchValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={openOptionList}
        onBlur={onBlur}
      />

      <button className={'indicator-button'} onClick={handleDeleteOption}>
        x
      </button>
      <button className={'indicator-button'} onClick={handleOpenList}>
        {isOpenList ? '닫기' : '열기'}
      </button>

      <OptionList
        options={filteredOptions}
        open={isOpenList}
        onSelect={handleSelectOption}
        focusedIndex={focusedIndex}
      />
    </div>
  );
}

export { Select };
