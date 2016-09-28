import React, {Component} from 'react'
import PinchZoomView from '../src/PinchZoomView'
import './style.css'

export default class App extends Component {
    constructor(props) {
        super(props)
        this.onLoadImage = this.onLoadImage.bind(this)
        this.state = {
            ratio: 100
        }
    }

    onLoadImage(e) {
        const { image } = this.refs
        this.setState({
            ratio: (image.height / image.width) * 100,
        })
    }

    render () {
        // images downloaded from http://lorempixel.com/600/400/nature/ and http://lorempixel.com/400/600/nature/ , I put it locally for debugging convenience
        return (
            <div className='container'>
                <h1>Demo of react-pinch-zoom-pan</h1>
                <p>
                    Desktop: Pinch by holding down <strong>ALT</strong> and drag from center of image and out.<br />
                    Touch: Pinch-zoom with two-finger gesture.<br />
                    When the image is zoomed you will be able to drag it within the container.
                </p>
                <h2>Horizontal Image</h2>
                <p>containerRatio is set to the same ratio as the image: {this.state.ratio.toFixed(2)}</p>
                <PinchZoomView debug backgroundColor='#ddd' maxScale={4} containerRatio={this.state.ratio}>
                    <img ref="image" src={require('./600x400.jpeg')} onLoad={this.onLoadImage} style={{
                        margin: 'auto',
                        width: '100%',
                        height: 'auto'
                    }} />
                </PinchZoomView>
                <h2>Vertical Image</h2>
                <p>Where ratio is set to containerRatio is set to 100 (equal height and width)</p>
                <PinchZoomView debug backgroundColor='#ddd' maxScale={3} containerRatio={100}>
                    <img src={require('./400x600.jpeg')} style={{
                        margin: 'auto',
                        width: 'auto',
                        height: '100%'
                    }} />
                </PinchZoomView>
                <h2>Vertical Scrolling</h2>
                <p>If the image is fit to the width and can be scrolled vertically</p>
                <PinchZoomView debug backgroundColor='#ddd' maxScale={3} containerRatio={100} verticalScroll={true}>
                    <img src={require('./400x600.jpeg')} style={{
                        margin: 'auto',
                        width: '100%',
                        height: 'auto'
                    }} />
                </PinchZoomView>
            </div>
        )
    }
}
