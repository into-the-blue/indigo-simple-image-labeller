import React from 'react';
import { Button } from 'antd';
import styles from '../labelImages.css';
import Mousetrap from 'mousetrap';
class ImageBrowser extends React.Component {
  componentDidMount() {
    this._initKeyboardListener();
  }
  _initKeyboardListener = () => {
    const { lastImage, skipOne, nextImage } = this.props;
    Mousetrap.bind('left', lastImage);
    Mousetrap.bind('up', lastImage);

    Mousetrap.bind('space space', skipOne);

    Mousetrap.bind('right', nextImage);
    Mousetrap.bind('down', nextImage);
  };
  render() {
    const { image, lastImage, skipOne, nextImage } = this.props;
    const { uri, extname, filename } = image;
    return (
      <div>
        <div className={styles.rowCenter}>
          <h3>{'filename: ' + filename}</h3>
        </div>
        <img
          src={uri}
          style={{ width: '100%', objectFit: 'contain' }}
          alt={'img'}
        />
        <div
          className={styles.rowCenter}
          style={{ justifyContent: 'space-between', width: '100%' }}
        >
          <Button onClick={() => lastImage(image)}>{'⬅️ or ⬆️ Last'}</Button>
          <Button onClick={() => skipOne(image)}>{'Skip space+space'}</Button>
          <Button onClick={() => nextImage(image)}>{'Next ⬇️ or ➡️'}</Button>
        </div>
      </div>
    );
  }
}

export default ImageBrowser;
