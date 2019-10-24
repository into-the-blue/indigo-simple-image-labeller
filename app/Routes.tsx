import * as React from 'react';
import { Switch, Route, BrowserRouter, Router } from 'react-router-dom';
import LabelImage from './containers/labelImages/labelImages.viewModel';
export default class Routes extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <div>
          {/* <Switch> */}
          <Route path={'/'} component={LabelImage} />
          {/* </Switch> */}
        </div>
      </BrowserRouter>
    );
  }
}
