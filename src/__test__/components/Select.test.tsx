import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Select } from '../../components/Select';
import Option from '../../entity/Option';

const options = [
  { value: 'foo', label: 'foo' },
  { value: 'bar', label: 'bar' },
  { value: 'baz', label: 'baz' },
  { value: 'qux', label: 'qux' },
];

beforeAll(() => {
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    value: jest.fn(() => ({
      measureText: (text: string) => ({ width: text.length * 10 }), // 문자열 길이에 기반한 너비 추정
    })),
  });
});

describe('<Select /> TEST', () => {
  it('초기 값이 제대로 렌더링된다.', () => {
    render(<Select options={options} value={'bar123'} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('bar123');
  });

  it('300ms 후 promise 함수 타입의 옵션 목록을 받아 렌더링한다.', async () => {
    const asyncOptions = async () => {
      return new Promise<Option[]>((resolve) => {
        setTimeout(() => {
          resolve(options);
        }, 300);
      });
    };

    render(<Select options={asyncOptions} />);

    const toggleButton = screen.getByRole('button', { name: 'arrow icon' });
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByText('foo')).toBeInTheDocument();
      expect(screen.getByText('bar')).toBeInTheDocument();
    });
  });

  it('text input과 button 2개가 렌더링된다.', () => {
    render(<Select options={options} />);

    const input = screen.getByRole('textbox');
    const deleteButton = screen.getByRole('button', { name: 'close icon' });
    const toggleButton = screen.getByRole('button', { name: 'arrow icon' });

    expect(input).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();
    expect(toggleButton).toBeInTheDocument();
  });

  it('토글 버튼을 클릭하면 옵션 목록이 보인다.', async () => {
    render(<Select options={options} />);

    const toggleButton = screen.getByRole('button', { name: 'arrow icon' });
    fireEvent.click(toggleButton);

    expect(screen.getByText('foo')).toBeInTheDocument();
    expect(screen.getByText('bar')).toBeInTheDocument();
  });

  it('토글 버튼을 2번 클릭하면 옵션 목록이 닫힌다.', () => {
    render(<Select options={options} />);

    const toggleButton = screen.getByRole('button', { name: 'arrow icon' });
    fireEvent.click(toggleButton);
    fireEvent.click(toggleButton);

    expect(screen.queryByText('foo')).not.toBeInTheDocument();
    expect(screen.queryByText('bar')).not.toBeInTheDocument();
  });

  it('옵션을 클릭해 선택한다.', () => {
    render(<Select options={options} />);

    const toggleButton = screen.getByRole('button', { name: 'arrow icon' });
    fireEvent.click(toggleButton);

    const option = screen.getByText('foo');
    fireEvent.click(option);

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('foo');
  });

  it('삭제 버튼을 클릭하면 Input의 텍스트가 지워진다.', () => {
    render(<Select options={options} />);

    const toggleButton = screen.getByRole('button', { name: 'arrow icon' });
    fireEvent.click(toggleButton);

    const option = screen.getByText('foo');
    fireEvent.click(option);

    const deleteButton = screen.getByRole('button', { name: 'close icon' });
    fireEvent.click(deleteButton);

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('');
  });

  it('input이 포커싱 되면 옵션 목록이 보여진다.', () => {
    render(<Select options={options} />);

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);

    expect(screen.queryByText('foo1')).not.toBeInTheDocument();
    expect(screen.getByText('foo')).toBeInTheDocument();
    expect(screen.getByText('bar')).toBeInTheDocument();
  });

  it('input이 포커싱 상태인 경우, 키보드 위,아래 방향키를 입력해 옵션을 고를 수 있다.', () => {
    render(<Select options={options} />);

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);

    fireEvent.keyDown(input, { key: 'ArrowDown' });

    const option1 = screen.getByText('foo');
    expect(option1.parentElement).toHaveClass('focused');

    fireEvent.keyDown(input, { key: 'ArrowDown' });

    const option2 = screen.getByText('bar');
    expect(option1.parentElement).not.toHaveClass('focused');
    expect(option2.parentElement).toHaveClass('focused');

    fireEvent.keyDown(input, { key: 'ArrowUp' });

    expect(option1.parentElement).toHaveClass('focused');
    expect(option2.parentElement).not.toHaveClass('focused');
  });

  it('Enter 키로 옵션을 선택할 수 있다.', () => {
    render(<Select options={options} />);

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(input).toHaveValue('foo');
  });

  it('방향키를 통해 포커싱된 옵션을 따라 스크롤 된다.', () => {
    render(<Select options={options} />);

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    const option = screen.getByText('qux');
    expect(option.parentElement).toHaveClass('focused');
    expect(option).toBeVisible();
  });

  it('ESC 키를 누르면 열린 옵션 목록이 닫힌다.', async () => {
    render(<Select options={options} />);

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(screen.getByText('foo')).toBeInTheDocument();

    fireEvent.keyDown(input, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByText('foo')).not.toBeInTheDocument();
    });
  });

  it('사용자가 입력한 값으로 옵션 목록을 필터링할 수 있다.', () => {
    render(<Select options={options} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'ba' } });

    expect(screen.getByText('bar')).toBeInTheDocument();
    expect(screen.getByText('baz')).toBeInTheDocument();
    expect(screen.queryByText('foo')).not.toBeInTheDocument();
  });

  it('필터링 된 옵션이 없는 경우, "검색 결과가 없어요." 메시지가 나타난다.', () => {
    render(<Select options={options} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'xyz123' } });

    expect(screen.getByText('검색 결과가 없어요.')).toBeVisible();
  });

  it('옵션이 이미 선택된 상태에서 다른 옵션을 선택할 수 있다.', async () => {
    render(<Select options={options} />);

    const toggleButton = screen.getByRole('button', { name: 'arrow icon' });
    fireEvent.click(toggleButton);

    const option1 = screen.getByText('foo');
    fireEvent.click(option1);

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('foo');

    const option2 = screen.getByText('baz');
    fireEvent.click(option2);

    expect(input).toHaveValue('baz');
  });

  it('input 하단의 공간이 부족한 경우, 목록이 위로 열린다.', async () => {
    render(<Select options={options} />);

    const input = screen.getByRole('textbox');

    // inputRef Mocking,  화면 하단에 있다고 가정
    const rect = {
      bottom: window.innerHeight + 100,
      top: window.innerHeight - 50,
      height: 50,
      left: 0,
      right: 100,
      width: 100,
      x: 0,
      y: window.innerHeight - 50,
      toJSON: () => {},
    };

    jest.spyOn(input, 'getBoundingClientRect').mockReturnValue(rect);
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByTestId('option-list')).toHaveStyle('top: auto');
      // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
      expect(screen.getByTestId('option-list')).toHaveStyle('bottom: 54px'); // `${inputRect.height + 4}px`
    });
  });
});
