import { mount } from 'enzyme';
import KeyCode from 'rc-util/lib/KeyCode';
import classNames from 'classnames';
import * as React from 'react';
import Select, { OptGroup, Option } from '../src';
import allowClearTest from './shared/allowClearTest';
import blurTest from './shared/blurTest';
import dynamicChildrenTest from './shared/dynamicChildrenTest';
import focusTest from './shared/focusTest';
import hoverTest from './shared/hoverTest';
import inputFilterTest from './shared/inputFilterTest';
import openControlledTest from './shared/openControlledTest';
import removeSelectedTest from './shared/removeSelectedTest';
import renderTest from './shared/renderTest';
import throwOptionValue from './shared/throwOptionValue';
import { injectRunAllTimers, findSelection, expectOpen, toggleOpen } from './utils/common';

describe('Select.Tags', () => {
  injectRunAllTimers(jest);

  allowClearTest('tags', ['1128']);
  focusTest('tags', {});
  blurTest('tags');
  hoverTest('tags');
  renderTest('tags');
  removeSelectedTest('tags');
  throwOptionValue('tags');
  dynamicChildrenTest('tags', {});
  inputFilterTest('tags');
  openControlledTest('tags');

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('allow user input tags', () => {
    const wrapper = mount(<Select mode="tags" />);

    wrapper
      .find('input')
      .simulate('change', { target: { value: 'foo' } })
      .simulate('keyDown', { which: KeyCode.ENTER });

    expect(findSelection(wrapper).text()).toBe('foo');
  });

  it('should call onChange on blur', () => {
    const onChange = jest.fn();
    const wrapper = mount(<Select mode="tags" onChange={onChange} />);

    wrapper
      .find('input')
      .simulate('change', { target: { value: 'foo' } })
      .simulate('blur');

    jest.runAllTimers();
    expect(findSelection(wrapper).text()).toBe('foo');
    expect(onChange).toHaveBeenCalledWith(['foo'], [{}]);
  });

  it('tokenize input', () => {
    const handleChange = jest.fn();
    const handleSelect = jest.fn();
    const option2 = <Option value="2">2</Option>;
    const wrapper = mount(
      <Select mode="tags" tokenSeparators={[',']} onChange={handleChange} onSelect={handleSelect}>
        <Option value="1">1</Option>
        {option2}
      </Select>,
    );

    wrapper.find('input').simulate('change', { target: { value: '2,3,4' } });

    expect(handleChange).toHaveBeenCalledWith(['2', '3', '4'], expect.anything());
    expect(handleSelect).toHaveBeenCalledTimes(3);
    expect(handleSelect).toHaveBeenLastCalledWith('4', expect.anything());
    expect(findSelection(wrapper).text()).toEqual('2');
    expect(findSelection(wrapper, 1).text()).toEqual('3');
    expect(findSelection(wrapper, 2).text()).toEqual('4');
    expect(wrapper.find('input').props().value).toBe('');
    expectOpen(wrapper, false);
  });

  it("shounld't separate words when compositing", () => {
    const handleChange = jest.fn();
    const handleSelect = jest.fn();
    const wrapper = mount(
      <Select mode="tags" tokenSeparators={[',']} onChange={handleChange} onSelect={handleSelect}>
        <Option value="1">1</Option>
        <Option value="2">2</Option>
      </Select>,
    );

    wrapper.find('input').simulate('compositionstart');
    wrapper.find('input').simulate('change', { target: { value: '2,3,4' } });
    expect(handleChange).not.toHaveBeenCalled();
    handleChange.mockReset();
    wrapper.find('input').simulate('compositionend');
    wrapper.find('input').simulate('change', { target: { value: '2,3,4' } });
    expect(handleChange).toHaveBeenCalledWith(['2', '3', '4'], expect.anything());
    expect(handleSelect).toHaveBeenCalledTimes(3);
    expect(handleSelect).toHaveBeenLastCalledWith('4', expect.anything());
    expect(findSelection(wrapper).text()).toEqual('2');
    expect(findSelection(wrapper, 1).text()).toEqual('3');
    expect(findSelection(wrapper, 2).text()).toEqual('4');
    expect(wrapper.find('input').props().value).toBe('');
    expectOpen(wrapper, false);
  });

  it('should work when menu is closed', () => {
    const handleChange = jest.fn();
    const handleSelect = jest.fn();
    const wrapper = mount(
      <Select
        mode="tags"
        tokenSeparators={[',']}
        onChange={handleChange}
        onSelect={handleSelect}
        open={false}
      >
        <Option value="1">1</Option>
        <Option value="2">2</Option>
      </Select>,
    );
    wrapper.find('input').simulate('compositionstart');
    wrapper.find('input').simulate('change', { target: { value: 'Star Kirby' } });
    wrapper.find('input').simulate('keydown', { which: KeyCode.ENTER });
    expect(handleChange).not.toHaveBeenCalled();
    handleChange.mockReset();
    wrapper.find('input').simulate('compositionend');
    wrapper.find('input').simulate('keydown', { which: KeyCode.ENTER });
    expect(handleChange).toHaveBeenCalledWith(['Star Kirby'], expect.anything());
    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(findSelection(wrapper).text()).toEqual('Star Kirby');
    expect(wrapper.find('input').props().value).toBe('');
    expectOpen(wrapper, false);
  });

  // Paste tests
  [
    {
      tokenSeparators: [' ', '\n'],
      clipboardText: '\n  light\n  bamboo\n  ',
      inputValue: '   light   bamboo   ',
    },
    {
      tokenSeparators: ['\r\n'],
      clipboardText: '\r\nlight\r\nbamboo\r\n',
      inputValue: ' light bamboo ',
    },
    {
      tokenSeparators: [' ', '\r\n'],
      clipboardText: '\r\n light\r\n bamboo\r\n ',
      inputValue: '  light  bamboo  ',
    },
    {
      tokenSeparators: ['\n'],
      clipboardText: '\nlight\nbamboo\n',
      inputValue: ' light bamboo ',
    },
  ].forEach(({ tokenSeparators, clipboardText, inputValue }) => {
    it(`paste content to split (${JSON.stringify(tokenSeparators)})`, () => {
      const onChange = jest.fn();
      const wrapper = mount(
        <Select mode="tags" tokenSeparators={tokenSeparators} onChange={onChange}>
          <Option value="1">1</Option>
        </Select>,
      );

      wrapper.find('input').simulate('paste', {
        clipboardData: {
          getData: () => clipboardText,
        },
      });
      wrapper.find('input').simulate('change', {
        target: { value: inputValue },
      });

      expect(onChange).toHaveBeenCalledWith(['light', 'bamboo'], expect.anything());
      expect(onChange).toHaveBeenCalledTimes(1);
    });
  });

  it('renders unlisted item in value', () => {
    const wrapper = mount(
      <Select mode="tags" value="3" open>
        <Option value="1">1</Option>
        <Option value="2">2</Option>
      </Select>,
    );

    expect(wrapper.find('List').props().data).toHaveLength(3);
  });

  it('dropdown keeps order', () => {
    const wrapper = mount(<Select mode="tags" open value={['aaaaa', 'aaa']} />);

    wrapper.find('input').simulate('change', { target: { value: 'aaa' } });
    expectOpen(wrapper);
    expect(wrapper.find('List').props().data).toEqual([
      expect.objectContaining({ key: 'aaa' }),
      expect.objectContaining({ key: 'aaaaa' }),
    ]);
  });

  it('renders search value when not found', () => {
    const wrapper = mount(
      <Select mode="tags" value="22" searchValue="2" open>
        <Option value="1">1</Option>
      </Select>,
    );

    expect(wrapper.find('List').props().data).toEqual([
      expect.objectContaining({
        data: expect.objectContaining({ value: '2' }),
      }),
      expect.objectContaining({
        data: expect.objectContaining({ value: '22' }),
      }),
    ]);
  });

  it('renders options matched with optionFilterProp', () => {
    const wrapper = mount(
      <Select open value="22" mode="tags" searchValue="option-1" optionFilterProp="children">
        <Option value="1">option-1</Option>
        <Option value="2">option-2</Option>
      </Select>,
    );

    expect(wrapper.find('List').props().data).toEqual([
      expect.objectContaining({
        data: expect.objectContaining({ value: '1' }),
      }),
    ]);
  });

  it('use filterOption', () => {
    const filterOption = (inputValue, option) =>
      option.value.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1;

    const wrapper = mount(
      <Select mode="tags" searchValue="red" filterOption={filterOption} open>
        <Option value="Red">Red</Option>
      </Select>,
    );

    expect(wrapper.find('List').props().data).toHaveLength(2);
  });

  it('filterOption is false', () => {
    const onChange = jest.fn();
    const wrapper = mount(
      <Select mode="tags" filterOption={false} onChange={onChange}>
        <Option value="1">1</Option>
        <Option value="2">2</Option>
      </Select>,
    );

    wrapper.find('input').simulate('change', { target: { value: 'a' } });
    expect(wrapper.find('List').props().data).toHaveLength(3);

    wrapper.find('input').simulate('keyDown', { which: KeyCode.ENTER });
    expect(onChange).toHaveBeenCalledWith(['a'], expect.anything());
  });

  it('can render custom tags', () => {
    const onTagRender = jest.fn();
    const tagRender = (props: any) => {
      const { label } = props;
      onTagRender(label);
      return (
        <span className={classNames(label, 'customize-tag')}>
          {label}
          {label}
        </span>
      );
    };
    const wrapper = mount(<Select mode="tags" tokenSeparators={[',']} tagRender={tagRender} />);

    wrapper.find('input').simulate('change', { target: { value: '1,A,42' } });

    expect(wrapper.find('span.A').length).toBe(1);
    expect(wrapper.find('span.A').text()).toBe('AA');
    expect(onTagRender).toHaveBeenCalledTimes(3);
    expect(wrapper.find('.customize-tag')).toHaveLength(3);
  });

  describe('OptGroup', () => {
    const createSelect = props => (
      <div>
        <Select mode="tags" {...props}>
          <OptGroup key="Manager" label="Manager">
            <Option key="jack" value="jack">
              Jack
            </Option>
          </OptGroup>
          <OptGroup key="Engineer" label="Engineer">
            <Option key="Yiminghe" value="Yiminghe">
              yiminghe
            </Option>
          </OptGroup>
        </Select>
      </div>
    );

    it('renders correctly', () => {
      const wrapper = mount(createSelect({ value: ['jack', 'foo'] }));
      toggleOpen(wrapper);
      expect(wrapper.render()).toMatchSnapshot();
    });

    it('renders inputValue correctly', () => {
      const wrapper = mount(createSelect({}));
      toggleOpen(wrapper);

      wrapper.find('input').simulate('change', { target: { value: 'foo' } });
      expect(wrapper.find('List').props().data).toHaveLength(1);

      wrapper.find('input').simulate('keyDown', { which: KeyCode.ENTER });
      expect(wrapper.find('List').props().data).toHaveLength(5);
    });

    it('should work fine when filterOption function exists', () => {
      const children = [];
      for (let i = 10; i < 36; i += 1) {
        children.push(
          <Option key={i.toString(36) + i} disabled={!(i % 3)}>
            {i.toString(36) + i}
          </Option>,
        );
      }
      const wrapper = mount(
        <Select
          mode="tags"
          style={{ width: '100%' }}
          placeholder="Tags Mode"
          filterOption={(input, { key }) => String(key).indexOf(input) >= 0}
        >
          {children}
        </Select>,
      );
      toggleOpen(wrapper);
      wrapper.find('input').simulate('change', { target: { value: 'f' } });
      expect(wrapper.find('List').props().data).toHaveLength(2);
      wrapper.find('input').simulate('keyDown', { which: KeyCode.ENTER });
      expect(findSelection(wrapper).text()).toEqual('f');
    });
  });
});
