import React, { useState } from 'react';
import { Checkbox, Row, Icon, Input, Button, Tag } from 'antd';
import styles from '../labelImages.css';
import { InputLabel } from './index';
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
      annotation,
      boundKeys,
      deleteOption
    } = this.props;
    const { key } = this.state;
    const keyBound = !key.length ? false : boundKeys.some(o => o.key === key);
    return (
      <div
        className={styles.rowCenter}
        style={{ marginTop: 5, marginBottom: 5 }}
      >
        <Icon
          type={'minus-circle'}
          onClick={deleteOption}
          style={{ fontSize: 20, color: 'red', marginRight: 15 }}
        />
        <Button
          onClick={() => onPressOption(value, isSelected)}
          type={isSelected ? 'primary' : 'default'}
          style={{ width: 70 }}
        >
          {value}
        </Button>
        <h4>{annotation}</h4>
        <Input
          value={key}
          onChange={e => this.setState({ key: e.target.value.trim() })}
          style={{ width: 50, marginLeft: 10, marginRight: 10 }}
          disabled={keyBound}
          placeholder={'keyboard'}
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
    const {
      labelObj,
      selectedValues,
      boundKeys,
      idx,
      onPressAdd,
      onPressOption,
      deleteOption,
      deleteLabelObj
    } = this.props;
    const { options, type } = labelObj;
    return (
      <div
        style={{
          padding: 10,
          borderWidth: '0px 0px 0px 1px',
          borderStyle: 'solid',
          borderColor: 'grey'
        }}
      >
        <div className={styles.rowCenter}>
          <h3>{type}</h3>
          <Icon
            type={'minus-circle'}
            onClick={deleteLabelObj}
            style={{ color: 'red', fontSize: 25, marginLeft: 15 }}
          />
        </div>
        {options.map(({ value, annotation }, index) => (
          <Option
            key={'opt' + index}
            isSelected={selectedValues.includes(value)}
            annotation={annotation}
            value={value}
            boundKeys={boundKeys}
            bindKey={kv => this.onChangeBind(kv, false)}
            unbindKey={kv => this.onChangeBind(kv, true)}
            onPressOption={onPressOption}
            deleteOption={() => deleteOption(value, index)}
          />
        ))}
        <InputLabel onPressAdd={onPressAdd} />
      </div>
    );
  }
}
