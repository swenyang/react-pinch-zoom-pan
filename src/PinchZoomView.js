import React, {Component, PropTypes} from 'react'
import autoPrefix from 'react-prefixr'

const isTouch = () => {
    return (('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0) ||
    (navigator.msMaxTouchPoints > 0))
}

const hasTwoTouchPoints = (event) => {
    if (isTouch()) {
        return event.touches && event.touches.length === 2
    } else {
        return event.altKey
    }
}

const between = (min, max, val) => {
    return Math.min(max, Math.max(min, val))
}

const normalizeTouch = (e) => {
    const p = isTouch() ? e.touches[0] : e
    return {
        x: p.clientX,
        y: p.clientY
    }
}

const translatePos = (point, size) => {
    return {
        x: (point.x - (size.width / 2)),
        y: (point.y - (size.height / 2))
    }
}

class PinchZoomView extends Component {
    static propTypes = {
        containerRatio: PropTypes.number,
        maxScale: PropTypes.number,
        children: PropTypes.element,
        backgroundColor: PropTypes.string,
        debug: PropTypes.bool
    }

    static defaultProps = {
        maxScale: 2,
        containerRatio: 100,
        backgroundColor: '#f2f2f2',
        debug: false
    }

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

    componentDidMount() {
        this.registerListeners()
    }

    mStartPoint
    mLastMovePoint
    mLastTimestamp
    onTouchStart(e) {
        e.preventDefault()
        if (!this.mLastTimestamp) {
            this.mLastTimestamp = new Date().getTime()
        }
        else {
            const newTimestamp = new Date().getTime()
            if (newTimestamp - this.mLastTimestamp > 500) {
                this.mLastTimestamp = newTimestamp
            }
            else {
                const { scale, x, y } = this.state
                const { maxScale } = this.props
                const average = (1 + maxScale) / 2
                if (scale < average) {
                    this.setState({
                        ...this.state,
                        scale: average,
                        x: (average < 1.01) ? 0 : x,
                        y: (average < 1.01) ? 0 : y,
                    })
                }
                else {
                    this.setState({
                        ...this.state,
                        scale: 1,
                        x: 0,
                        y: 0,
                    })
                }
                return
            }
        }
        this.mStartPoint = normalizeTouch(e)
    }

    onTouchMove(e) {
        if (!this.mStartPoint || !this.refs.root) {
            return
        }
        const domNode = this.refs.root
        const size = {
            width: domNode.offsetWidth,
            height: domNode.offsetHeight,
        }

        const { scale, x, y } = this.state
        const { maxScale } = this.props
        const movePoint = normalizeTouch(e)

        if (hasTwoTouchPoints(e)) {
            let scaleFactor
            if (isTouch() && e.scale && false) {
                scaleFactor = e.scale
            }
            else if (movePoint.x < (size.width / 2)) {
                scaleFactor = scale + ((translatePos(this.mStartPoint, size).x - translatePos(movePoint, size).x) / size.width)
            }
            else {
                scaleFactor = scale + ((translatePos(movePoint, size).x - translatePos(this.mStartPoint, size).x) / size.width)
            }
            scaleFactor = between(1, maxScale, scaleFactor)
            this.setState({
                ...this.state,
                scale: scaleFactor,
                x: (scaleFactor < 1.01) ? 0 : x,
                y: (scaleFactor < 1.01) ? 0 : y,
            })
        } else {
            const maxOffsetX = ((size.width * scale) - size.width) / (scale * 2)
            const maxOffsetY = ((size.height * scale) - size.height) / (scale * 2)
            const last = this.mLastMovePoint ? this.mLastMovePoint : this.mStartPoint
            this.setState({
                ...this.state,
                x: between(-maxOffsetX, maxOffsetX, this.state.x + movePoint.x - last.x),
                y: between(-maxOffsetY, maxOffsetY, this.state.y + movePoint.y - last.y),
            })
            this.mLastMovePoint = movePoint
        }
    }

    onTouchEnd() {
        this.mStartPoint = null
        this.mLastMovePoint = null
    }

    registerListeners() {
        this.refs.root.addEventListener(isTouch() ? 'touchstart' : 'mousedown', this.onTouchStart)
        window.addEventListener(isTouch() ? 'touchmove' : 'mousemove', this.onTouchMove)
        window.addEventListener(isTouch() ? 'touchend' : 'mouseup', this.onTouchEnd)
    }

    getContainerStyle() {
        const { backgroundColor, containerRatio } = this.props
        return {
            paddingTop: containerRatio.toFixed(2) + '%',
            overflow: 'hidden',
            position: 'relative',
            background: backgroundColor
        }
    }

    getInnerStyle() {
        return {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
        }
    }

    getHolderStyle() {
        return {
            position: 'relative'
        }
    }

    getContentStyle(obj) {
        return {
            width: '100%',
            height: '100%',
            align: 'center',
            display: 'flex',
            alignItems: 'center',
            transform: `scale(${obj.scale}) translateY(${obj.y}px) translateX(${obj.x}px)`,
            transition: '.3s ease-out'
        }
    }

    renderDebug(obj) {
        return (
            <div
                style={{position: 'absolute', bottom: 0, left: 0, background: '#555', color: '#fff', padding: '3px 6px'}}>
                Scale: {obj.scale}, X: {obj.x}, Y: {obj.y}
            </div>
        )
    }

    render() {
        const { debug, children } = this.props
        const displayData = {
            x: this.state.x.toFixed(2),
            y: this.state.y.toFixed(2),
            scale: this.state.scale.toFixed(2)
        }
        return (
            <div ref="root">
                <div style={this.getHolderStyle()}>
                    <div style={this.getContainerStyle()}>
                        <div style={this.getInnerStyle()}>
                            <div style={autoPrefix(this.getContentStyle(displayData))}>
                                {children}
                            </div>
                        </div>
                    </div>
                    {debug && this.renderDebug(displayData)}
                </div>
            </div>
        )
    }
}

export default PinchZoomView
