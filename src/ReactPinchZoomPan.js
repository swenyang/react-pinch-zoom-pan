import React, {Component, PropTypes} from 'react'
import throttle from 'lodash.throttle'

function isTouch() {
    return (('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0) ||
    (navigator.msMaxTouchPoints > 0))
}

function hasTwoTouchPoints(event) {
    if (isTouch()) {
        return event.touches && event.touches.length === 2
    } else {
        return event.altKey
    }
}

function between(min, max, val) {
    return Math.min(max, Math.max(min, val))
}

function inverse(val) {
    return val * -1
}

function normalizeTouch(e) {
    const p = isTouch() ? e.touches[0] : e
    return {
        x: p.clientX,
        y: p.clientY
    }
}

class ReactPinchZoomPan extends Component {
    constructor(props) {
        super(props)
        this.onTouchStart = this.onTouchStart.bind(this)
        this.onTouchMove = this.onTouchMove.bind(this)
        this.onTouchEnd = this.onTouchEnd.bind(this)
        this.state = {
            scale: 1,
            x: 0,
            y: 0,
        }
    }

    resize() {
        if (this.refs.root) {
            const domNode = this.refs.root
            this.setState({
                ...this.state,
                size: {
                    width: domNode.offsetWidth,
                    height: domNode.offsetHeight,
                },
            })
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resize)
    }

    componentDidMount() {
        this.handlePinch()
        this.resize()
        window.addEventListener('resize', throttle(() => this.resize(), 500))
    }

    mStartPoint
    onTouchStart(e) {
        e.preventDefault()
        this.mStartPoint = normalizeTouch(e)
    }

    translatePos(point, size) {
        return {
            x: (point.x - (size.width / 2)),
            y: (point.y - (size.height / 2))
        }
    }

    onTouchMove(e) {
        if (!this.mStartPoint) {
            return
        }
        const { size } = this.state

        const { scale, x, y } = this.state
        const { maxScale } = this.props
        const movePoint = normalizeTouch(e)

        if (hasTwoTouchPoints(e)) {
            let scaleFactor
            if (isTouch()) {
                scaleFactor = e.scale
            } else {
                scaleFactor = (movePoint.x < (size.width / 2)) ?
                    scale + ((this.translatePos(this.mStartPoint, size).x - this.translatePos(movePoint, size).x) / size.width)
                    : scale + ((this.translatePos(movePoint, size).x - this.translatePos(this.mStartPoint, size).x) / size.width)
            }
            scaleFactor = between(1, maxScale, scaleFactor)
            this.setState({
                ...this.state,
                scale: scaleFactor,
                x: (scaleFactor < 1.01) ? 0 : x,
                y: (scaleFactor < 1.01) ? 0 : y,
            })
        } else {
            const scaleFactorX = ((size.width * scale) - size.width) / (maxScale * 2)
            const scaleFactorY = ((size.height * scale) - size.height) / (maxScale * 2)
            this.setState({
                ...this.state,
                x: between(inverse(scaleFactorX), scaleFactorX, movePoint.x - this.mStartPoint.x),
                y: between(inverse(scaleFactorY), scaleFactorY, movePoint.y - this.mStartPoint.y)
            })
        }
    }

    onTouchEnd() {
        this.mStartPoint = null
    }

    handlePinch() {
        const domNode = this.refs.root
        domNode.addEventListener(isTouch() ? 'touchstart' : 'mousedown', this.onTouchStart)
        window.addEventListener(isTouch() ? 'touchmove' : 'mousemove', this.onTouchMove)
        window.addEventListener(isTouch() ? 'touchend' : 'mouseup', this.onTouchEnd)
    }

    render() {
        const {scale, x, y} = this.state
        return (
            <div ref='root'>
                {this.props.render({
                    x: x.toFixed(2),
                    y: y.toFixed(2),
                    scale: scale.toFixed(2)
                })}
            </div>
        )
    }
}

ReactPinchZoomPan.defaultProps = {
    maxScale: 2
}

ReactPinchZoomPan.propTypes = {
    render: PropTypes.func,
    maxScale: PropTypes.number
}

export default ReactPinchZoomPan
