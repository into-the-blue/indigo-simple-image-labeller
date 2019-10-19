import React, { useState } from 'react';
import { Input, Button } from 'antd';
import styles from '../labelImages.css';

/**
 *
 *
 * @export
 * @param {*} { onPressAdd({value,annotation}) }
 * @returns
 */
export class InputLabel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      annotation: ''
    };
  }
  _onPressAdd = () => {
    const { value, annotation } = this.state;
    if (!value.length) return;
    this.props.onPressAdd({
      value: value.trim(),
      annotation: annotation.trim()
    });
    this.setState({
      value: '',
      annotation: ''
    });
  };
  render() {
    const { value, annotation } = this.state;
    return (
      <div className={styles.rowCenter}>
        <Input
          value={value}
          onChange={e =>
            this.setState({
              value: e.target.value
            })
          }
          placeholder={'Label'}
          style={{ width: 70 }}
        />
        <Input
          value={annotation}
          onChange={e =>
            this.setState({
              annotation: e.target.value
            })
          }
          style={{ width: 70 }}
          placeholder={'annotation'}
        />
        <Button type={'primary'} onClick={this._onPressAdd}>
          {'Add'}
        </Button>
      </div>
    );
  }
}
