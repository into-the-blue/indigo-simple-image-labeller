import React from 'react';
import { SelectableItem } from './index';
import { Col, Input } from 'antd';
class Labels extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: ''
    };
  }
  onPressAdd = value => {
    console.log(value);
    if (!value.length) return;
    this.setState({
      value: ''
    });
    this.props.onPressAdd(value.trim());
  };
  onChange = e => {
    this.setState({
      value: e.target.value
    });
  };
  render() {
    const {
      options,
      onChangeOption,
      selectedOptions,
      boundKeys,
      onChangeBoundKey
    } = this.props;
    return (
      <Col>
        <Input.Search
          id={'add_tag'}
          value={this.state.value}
          onChange={this.onChange}
          onSearch={this.onPressAdd}
          enterButton={'Add'}
        />
        <SelectableItem
          options={options.map(o => ({
            label: o,
            value: o
          }))}
          onChangeOption={onChangeOption}
          selectedValues={selectedOptions}
          boundKeys={boundKeys}
          onChangeBoundKey={onChangeBoundKey}
        />
      </Col>
    );
  }
}

export default Labels;
