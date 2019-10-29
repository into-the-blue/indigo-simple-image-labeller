import React from 'react';
import Presenter from './labelImages.presenter';
import { Button, Row, Col, Modal, Tag, Icon } from 'antd';
import Labels from './components/Labels';
import styles from './labelImages.css';
import ImageBrowser from './components/ImageBrowser';

class LabelImages extends React.Component {
  _labels;
  constructor(props) {
    super(props);
    this.state = {
      currentIndex: 0,
      imageCount: 0,
      activeDir: '',
      modalVisible: false,
      mode: 'standard',
      labelsFromFile: []
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

  get getAllLabels() {
    return this._labels && this._labels.getAllLabels;
  }

  get getSelectedLabels() {
    return this._labels && this._labels.getSelectedLabels;
  }
  resetSelectedLabels = () => {
    this._labels && this._labels.resetSelectedLabels();
  };
  setSelectedLabels = labels =>
    this._labels && this._labels.setSelectedLabels(labels);

  setLabelObjs = labelObjs => {
    this._labels && this._labels.setLabelObjs(labelObjs);
    this.forceUpdate();
  };
  render() {
    return (
      <div
        style={{ overflow: 'scroll', height: '100vh', paddingBottom: '15vh' }}
      >
        <div className={styles.rowCenter}>
          <Button onClick={this.presenter.selectFolder}>
            {'select folder'}
          </Button>
          <Button
            onClick={this.presenter.loadSavedFile}
            style={{ marginLeft: 20 }}
          >
            {'restore form local'}
          </Button>
          <Button
            onClick={this.presenter.loadSkippedFiles}
            style={{ marginLeft: 20 }}
          >
            {'load skipped files'}
          </Button>
          <Button
            onClick={this.presenter.loadLabels}
            style={{ marginLeft: 20 }}
          >
            {'load labels'}
          </Button>
          <Button
            onClick={this.presenter.reviewFile}
            style={{ marginLeft: 20 }}
          >
            {'review file'}
          </Button>
          <Icon
            type="reload"
            onClick={() => this.forceUpdate()}
            style={{ marginLeft: 20, fontSize: 25 }}
          />
        </div>
        <div>
          <div className={styles.rowCenter}>
            {this._renderImageBrowser()}
            {this._renderBrief()}
          </div>
          {this._renderLabels()}
        </div>
        {this._labels && (
          <Modal
            title={'Are these labels ok?'}
            visible={this.state.modalVisible}
            okText={'Ok'}
            cancelText={'Cancel'}
            onCancel={() =>
              this.setState({
                modalVisible: false
              })
            }
            onOk={this.presenter.nextImage}
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
    const unassignedLabels = this.presenter.unassignedLabels;
    return (
      <div style={{ marginLeft: 20 }}>
        <h4>{'Active Dir: ' + activeDir}</h4>
        <h4>{'Info: ' + (currentIndex + 1) + '/' + imageCount}</h4>
        <h4>{'Labeled: ' + this.presenter.labeledImages.length}</h4>
        <h4>{'Json: ' + this.presenter.fileSavingName}</h4>
        <h4>{'Delimiter: ' + this.presenter.delimiter}</h4>
        {!!unassignedLabels.length && (
          <>
            <h4>{'Unassigned labels'}</h4>
            {unassignedLabels.map(value => (
              <Tag key={value}>{value}</Tag>
            ))}
          </>
        )}
      </div>
    );
  };

  _renderImageBrowser = () => {
    const { currentIndex } = this.state;
    const image = this.presenter.getCurrentImage(currentIndex);
    return (
      <div style={{ flex: 1, maxWidth: 1000 }}>
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
