import React, {Component, PropTypes} from 'react'

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

function normalizeTouch(e) {
    const p = isTouch() ? e.touches[0] : e
    return {
        x: p.clientX,
        y: p.clientY
    }
}

function translatePos(point, size) {
    return {
        x: (point.x - (size.width / 2)),
        y: (point.y - (size.height / 2))
    }
}

class ReactPinchZoomPan extends Component {
    static defaultProps = {
        maxScale: 2
    }

    static propTypes = {
        render: PropTypes.func,
        maxScale: PropTypes.number
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
    onTouchStart(e) {
        e.preventDefault()
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

    render() {
        const { scale, x, y } = this.state
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

export default ReactPinchZoomPan
