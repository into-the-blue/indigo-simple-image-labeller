import React, { useState } from 'react';
import { Checkbox, Row, Icon, Input, Button, Tag } from 'antd';
import styles from '../labelImages.css';
class Option extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      key: ''
    };
  }

  onPressUnbindKey = () => {
    this.props.unbindKey({ key: this.state.key, value: this.props.value });
    this.setState({
      key: ''
    });
  };

  render() {
    const {
      isSelected,
      bindKey,
      value,
      onPressOption,
      label,
      boundKeys
    } = this.props;
    const { key } = this.state;
    const keyBound = !key.length ? false : boundKeys.some(o => o.key === key);
    return (
      <div className={styles.rowCenter}>
        <Button
          onClick={() => onPressOption(value, isSelected)}
          type={isSelected ? 'primary' : 'default'}
          style={{ width: 70 }}
        >
          {label}
        </Button>
        <Input
          value={key}
          onChange={e => this.setState({ key: e.target.value.trim() })}
          style={{ width: 40, marginLeft: 10, marginRight: 10 }}
          disabled={keyBound}
        />
        <Button
          disabled={keyBound}
          onClick={() => bindKey({ key: key.trim(), value })}
        >
          {'bind'}
        </Button>
        {!!key.length && keyBound && (
          <Icon
            style={{ color: 'red', fontSize: 25 }}
            type={'delete'}
            onClick={this.onPressUnbindKey}
          />
        )}
      </div>
    );
  }
}
export class SelectableItem extends React.Component {
  onPressOption = (value, isSelected) => {
    const { onChangeOption, selectedValues } = this.props;
    if (isSelected) {
      onChangeOption(selectedValues.filter(o => o !== value));
    } else {
      onChangeOption(selectedValues.concat(value));
    }
  };
  onChangeBind = (kv, isBound) => {
    const { boundKeys, onChangeBoundKey } = this.props;
    if (isBound) {
      onChangeBoundKey(boundKeys.filter(o => o.key !== kv.key), {
        kv,
        operation: 'delete'
      });
    } else {
      onChangeBoundKey(boundKeys.concat(kv), { kv, operation: 'add' });
    }
  };
  render() {
    const { options, selectedValues, boundKeys } = this.props;
    return (
      <div>
        {options.map(({ value, label }, index) => (
          <Option
            key={'opt' + index}
            isSelected={selectedValues.includes(value)}
            label={label}
            value={value}
            boundKeys={boundKeys}
            bindKey={kv => this.onChangeBind(kv, false)}
            unbindKey={kv => this.onChangeBind(kv, true)}
            onPressOption={this.onPressOption}
          />
        ))}
      </div>
    );
  }
}
