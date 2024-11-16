import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

beforeAll(() => {
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    value: jest.fn(() => ({
      measureText: (text: string) => ({ width: text.length * 10 }), // 문자열 길이에 기반한 너비 추정
    })),
  });
});

describe('<App /> TEST', () => {
  it('<App/> 가 제대로 렌더링 된다.', () => {
    render(<App />);

    expect(screen.getAllByRole('textbox')).toHaveLength(2);
  });
});
