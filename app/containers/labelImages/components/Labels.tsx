import * as React from 'react';
import { SelectableItem } from './SelectableItem';
import { Col, Input, Button, message, Modal } from 'antd';
import '../labelImages.css';
import {} from './index';
import { flatten } from 'lodash';
import { ILabelObj, IBoundKey, IOption, ILabelObjType } from '../../../models';
interface IState {
  labelObjs: ILabelObj[];
  selectedValues: string[];
  boundKeys: IBoundKey[];
}
class Labels extends React.Component<any, IState> {
  constructor(props) {
    super(props);
    this.state = {
      labelObjs: [],
      selectedValues: [],
      boundKeys: []
    };
  }
  _onPressAdd = (idx: number) => (option: IOption) => {
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
  _onChangeBoundKey = (idx: number) => (
    boundKeys: IBoundKey[],
    updated: { kv: IBoundKey; operation: 'add' | 'delete' }
  ) => {
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

  _createLabelObj = (type: ILabelObjType) => () => {
    const { labelObjs } = this.state;
    this.setState({
      labelObjs: labelObjs.concat({
        type,
        options: []
      })
    });
  };
  _onPressOption = (idx: number) => (value: string, isSelected?: boolean) => {
    const { selectedValues, labelObjs } = this.state;
    const { type, options } = labelObjs[idx];
    const isRadio = type === 'radio';
    if (typeof isSelected === 'undefined') {
      isSelected = selectedValues.includes(value);
    }
    if (isSelected) {
      message.warn(value + ' removed');
      this.setState({
        selectedValues: selectedValues.filter(o => o !== value)
      });
    } else {
      let _selectedValues = selectedValues;
      if (isRadio) {
        _selectedValues = selectedValues.filter(v => {
          const bool = !options.some(o => o.value === v);
          if (!bool) {
            message.info(v + ' removed');
          }
          return bool;
        });
      }
      message.info(value + ' selected');

      this.setState({
        selectedValues: _selectedValues.concat(value)
      });
    }
  };

  _deleteOption = (idx: number) => (value: string, optionIndex: number) => {
    const { labelObjs } = this.state;

    const _labelObjs = labelObjs.map((o, i) => {
      if (i !== idx) return o;
      return {
        ...o,
        options: o.options.filter((_, i2) => i2 !== optionIndex)
      };
    });

    this.setState({
      labelObjs: _labelObjs
    });
  };

  _deleteLabelObj = idx => {
    Modal.confirm({
      title: 'Confirm',
      content: 'Delete this option group ?',
      okText: 'Yes',
      cancelText: 'Cancel',
      onOk: () => {
        const { labelObjs } = this.state;
        const _labelObjs = labelObjs.filter((_, i) => i !== idx);
        this.setState({
          labelObjs: _labelObjs
        });
      }
    });
  };

  get getSelectedLabels() {
    return this.state.selectedValues;
  }

  get getAllLabels() {
    return [
      ...new Set(
        flatten(this.state.labelObjs.map(o => o.options.map(o2 => o2.value)))
      )
    ];
  }

  resetSelectedLabels = () => {
    this.setState({
      selectedValues: []
    });
  };
  setSelectedLabels = (labels: string[]) => {
    this.setState({
      selectedValues: labels
    });
  };
  render() {
    const { labelObjs, selectedValues, boundKeys } = this.state;
    return (
      <Col>
        <Button onClick={this._createLabelObj('checkbox')}>
          {'Create checkbox'}
        </Button>
        <Button
          onClick={this._createLabelObj('radio')}
          style={{ marginLeft: 15 }}
        >
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
                deleteOption={this._deleteOption(index)}
                deleteLabelObj={() => this._deleteLabelObj(index)}
              />
            );
          })}
        </div>
      </Col>
    );
  }
}

export default Labels;
