import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Select } from '../../components/Select';

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
});
