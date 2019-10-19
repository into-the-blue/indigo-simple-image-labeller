import React from 'react';
import Presenter from './labelImages.presenter';
import { Button, Row, Col, Modal } from 'antd';
import Labels from './components/Labels';
import styles from './labelImages.css';
import ImageBrowser from './components/ImageBrowser';

// {
//   options: [
//     {
//       type: 'checkbox' | 'radio',
//       options: [
//         {
//           value: '',
//           annotation: ''
//         }
//       ]
//     }
//   ];
// }
class LabelImages extends React.Component {
  _labels;
  constructor(props) {
    super(props);
    this.state = {
      currentIndex: 0,
      imageCount: 0,
      activeDir: '',
      modalVisible: false
    };
    this.presenter = new Presenter(this.getStore, this);
  }
  componentDidMount() {
    this.presenter.componentDidMount();
  }

  getStore = () => ({
    store: this.state,
    setStore: next =>
      this.setState({
        ...next
      })
  });

  get getSelectedLabels() {
    return this._labels && this._labels.getSelectedLabels;
  }
  resetSelectedLabels = () => {
    this._labels && this._labels.resetSelectedLabels();
  };
  setSelectedLabels = labels =>
    this._labels && this._labels.setSelectedLabels(labels);
  render() {
    return (
      <div
        style={{ overflow: 'scroll', height: '100vh', paddingBottom: '15vh' }}
      >
        <div className={styles.row}>
          <Button onClick={this.presenter.selectFolder}>
            {'select folder'}
          </Button>
          <Button
            onClick={this.presenter.loadSavedFile}
            style={{ marginLeft: 20 }}
          >
            {'restore form local'}
          </Button>
          {this._renderBrief()}
        </div>
        <div>
          {this._renderImageBrowser()}
          {this._renderLabels()}
        </div>
        {this._labels && (
          <Modal
            title={'Are these labels ok?'}
            visible={this.state.modalVisible}
            okText={'Ok'}
            cancelText={'Cancel'}
          >
            {this.getSelectedLabels.map((label, index) => {
              return <p style={{ color: 'blue' }}>{label}</p>;
            })}
          </Modal>
        )}
      </div>
    );
  }
  _renderBrief = () => {
    const { activeDir, imageCount, currentIndex } = this.state;
    return (
      <div style={{ marginLeft: 20 }}>
        <h4>{'Active Dir: ' + activeDir}</h4>
        <h4>{'Info: ' + (currentIndex + 1) + '/' + imageCount}</h4>
        <h4>{'Labeled: ' + this.presenter.labeledImages.length}</h4>
        <h4>{'Json: ' + this.presenter.fileSavingName}</h4>
        <h4>{'Delimiter: ' + this.presenter.delimiter}</h4>
      </div>
    );
  };

  _renderImageBrowser = () => {
    const { currentIndex } = this.state;
    const image = this.presenter.getCurrentImage(currentIndex);
    return (
      <div style={{ flex: 1 }}>
        {image && (
          <ImageBrowser
            image={image}
            lastImage={this.presenter.lastImage}
            skipOne={this.presenter.skipOne}
            nextImage={this.presenter.nextImage}
          />
        )}
      </div>
    );
  };
  _renderLabels = () => {
    const { options, selectedOptions, boundKeys } = this.state;
    return (
      <div style={{}}>
        <Labels ref={r => (this._labels = r)} />
      </div>
    );
  };
}
export default LabelImages;
