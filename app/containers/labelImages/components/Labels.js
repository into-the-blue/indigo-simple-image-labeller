import React from 'react';
import { SelectableItem } from './SelectableItem';
import { Col, Input, Button } from 'antd';
import styles from '../labelImages.css';
import { InputLabel } from './index';
class Labels extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      labelObjs: [],
      selectedValues: [],
      boundKeys: []
    };
  }
  _onPressAdd = idx => option => {
    const { labelObjs } = this.state;
    const _labelObjs = labelObjs.map((o, i) => {
      if (i !== idx) return o;
      return {
        ...o,
        options: o.options.concat(option)
      };
    });
    this.setState({
      labelObjs: _labelObjs
    });
  };
  /**
   *
   *
   * updated :{
   * kv:{
   * key,
   * value
   * }
   * operation:'add' | 'delete'
   * }
   */
  _onChangeBoundKey = idx => (boundKeys, updated) => {
    this.setState({ boundKeys });
    const {
      kv: { key, value },
      operation
    } = updated;
    if (operation === 'add') {
      Mousetrap.bind(key, () => this._onPressOption(idx)(value));
    } else {
      Mousetrap.unbind(key);
    }
  };

  _createLabelObj = type => () => {
    const { labelObjs } = this.state;
    this.setState({
      labelObjs: labelObjs.concat({
        type,
        options: []
      })
    });
  };
  _onPressOption = idx => (value, isSelected) => {
    const { selectedValues, labelObjs } = this.state;
    const { type, options } = labelObjs[idx];
    const isRadio = type === 'radio';
    if (typeof isSelected === 'undefined') {
      isSelected = selectedValues.includes(value);
    }
    if (isSelected) {
      this.setState({
        selectedValues: selectedValues.filter(o => o !== value)
      });
    } else {
      let _selectedValues = selectedValues;
      if (isRadio) {
        _selectedValues = selectedValues.filter(
          value => !options.some(o => o.value === value)
        );
      }
      this.setState({
        selectedValues: _selectedValues.concat(value)
      });
    }
  };

  get getSelectedLabels() {
    return this.state.selectedValues;
  }

  resetSelectedLabels = () => {
    this.setState({
      selectedValues: []
    });
  };
  setSelectedLabels = labels => {
    this.setState({
      selectedValues: labels
    });
  };
  render() {
    const { labelObjs, selectedValues, boundKeys } = this.state;
    return (
      <Col>
        {/* <InputLabel _onPressAdd={this._onPressAdd} /> */}
        <Button onClick={this._createLabelObj('checkbox')}>
          {'Create checkbox'}
        </Button>
        <Button onClick={this._createLabelObj('radio')}>
          {'Create radio box'}
        </Button>
        <div
          style={{ display: 'flex', flexDirection: 'row', overflow: 'scroll' }}
        >
          {labelObjs.map((labelObj, index) => {
            return (
              <SelectableItem
                key={'gp' + index}
                labelObj={labelObj}
                idx={index}
                boundKeys={boundKeys}
                selectedValues={selectedValues}
                onChangeBoundKey={this._onChangeBoundKey(index)}
                onPressAdd={this._onPressAdd(index)}
                onPressOption={this._onPressOption(index)}
              />
            );
          })}
        </div>
      </Col>
    );
  }
}

export default Labels;
