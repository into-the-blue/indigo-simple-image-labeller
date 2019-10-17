import React from 'react';
import Presenter from './labelImages.presenter';
import { Button, Row, Col } from 'antd';
import {} from './components';
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
    const {
      options,
      selectedOptions,
      boundKeys,
      activeDir,
      imageCount,
      currentIndex
    } = this.state;
    const image = this.presenter.getCurrentImage(currentIndex);
    return (
      <div>
        <div className={styles.row}>
          <Button onClick={this.presenter.selectFolder}>
            {'select folder'}
          </Button>
          <div style={{ marginLeft: 20 }}>
            <h4>{'Active Dir: ' + activeDir}</h4>
            <h4>{'Image Count: ' + imageCount}</h4>
          </div>
        </div>
        <div className={styles.row}>
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
          <div
            style={{
              width: '30%',
              borderWidth: '0px 1px 0px 0px',
              borderStyle: 'solid',
              borderColor: 'grey'
              // flex: 1
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
        </div>
      </div>
    );
  }
}
export default LabelImages;
