import React from 'react';
import Presenter from './labelImages.presenter';
import { Button, Row, Col } from 'antd';
import Labels from './components/Labels';
import styles from './labelImages.css';
import ImageBrowser from './components/ImageBrowser';
class LabelImages extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentIndex: 0,
      options: [],
      selectedOptions: [],
      boundKeys: [],
      imageCount: 0,
      activeDir: ''
    };
    this.presenter = new Presenter(this.getStore);
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
  render() {
    const { activeDir, imageCount } = this.state;
    return (
      <div>
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
          <div style={{ marginLeft: 20 }}>
            <h4>{'Active Dir: ' + activeDir}</h4>
            <h4>{'Image Count: ' + imageCount}</h4>
          </div>
        </div>
        <div className={styles.row}>
          {this._renderImageBrowser()}
          {this._renderLabels()}
        </div>
      </div>
    );
  }

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
      <div
        style={{
          width: '30%'
        }}
      >
        <Labels
          options={options}
          onChangeOption={this.presenter.onChangeOption}
          selectedOptions={selectedOptions}
          onPressAdd={this.presenter.onPressAdd}
          onChangeBoundKey={this.presenter.onChangeBoundKey}
          boundKeys={boundKeys}
        />
      </div>
    );
  };
}
export default LabelImages;
