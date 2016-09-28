# react-pinch-zoom-pan

A react component that lets you add pinch-zoom and pan sub components. On touch you can pinch-zoom and pan the zoomed image. On desktop you can 'pinch' by holding down your *ALT-key* and do a mousedown from center of inner content onto the edges.

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

## Modifications

This repo forks from [ReactPinchZoomPan](https://github.com/gerhardsletten/react-pinch-zoom-pan), and make some modifications:

- Add double-tap-to-zoom feature
- Fix bugs that images can't be zoomed when you pinch them on Android devices
- Fix translation behavior and translation boundary
- Remove RxJS dependency, because it's too large for projects don't use it
- Remove `lodash.throttle` and `resize()` event
- Merge `PinchView` and `ReactPinchZoomPan` into one `PinchZoomView` component
- Change code style to ES6
- Remove ESLint temporarily

TODO:

- Optimize pinch-zoom behavior

## Usage

Take a look at demo/App.js for usage, you can also run it in your local enviroment by

`npm install & npm start`

and open [localhost:3001](http://localhost:3001)

```
import React, {Component} from 'react'
import {PinchView} from 'react-pinch-zoom-pan'

class App extends Component {
  render () {
    return (
      <PinchView debug backgroundColor='#ddd' maxScale={4} containerRatio={((400 / 600) * 100)}>
        <img src={'http://lorempixel.com/600/400/nature/'} style={{
          margin: 'auto',
          width: '100%',
          height: 'auto'
        }} />
      </PinchView>
    )
  }
}
```
