/**
 * @module WrapChimera
 */

const EventEmitter = require('events')
const VlcAudio = require('./VlcAudio')
const VlcPlaylist = require('./VlcPlaylist')
const VlcInput = require('./VlcInput')
const VlcSubtitles = require('./VlcSubtitles')
const VlcVideo = require('./VlcVideo')
const renderer = require('wcjs-renderer')
const {PlayerPixelFormat, StateValues} = require('./VlcEnums')


/**
 * VLC Player
 * @fires VlcPlayer#seek
 * @fires VlcPlayer#frameSetup
 * @fires VlcPlayer#frameReady
 * @fires VlcPlayer#frameCleanup
 * @fires VlcPlayer#mediaChange
 * @fires VlcPlayer#idle
 * @fires VlcPlayer#opening
 * @fires VlcPlayer#buffering
 * @fires VlcPlayer#play
 * @fires VlcPlayer#pause
 * @fires VlcPlayer#forward
 * @fires VlcPlayer#backward
 * @fires VlcPlayer#error
 * @fires VlcPlayer#ended
 * @fires VlcPlayer#stop
 * @fires VlcPlayer#timeChange
 * @fires VlcPlayer#positionChange
 * @fires VlcPlayer#seekableChange
 * @fires VlcPlayer#pausableChange
 * @fires VlcPlayer#durationChange
 * @fires VlcPlayer#message
 */
class VlcPlayer extends EventEmitter {
    constructor(player) {
        super();
        this._player = player;
        /**
         * VLC Input file
         * @type {VlcInput}
         */
        this.input = new VlcInput(player.input);
        /**
         * VLC Audio
         * @type {VlcAudio}
         */
        this.audio = new VlcAudio(player.audio);
        /**
         * VLC Video
         * @type {VlcVideo}
         */
        this.video = new VlcVideo(player.video);
        /**
         * VLC Subtitles
         * @type {VlcSubtitles}
         */
        this.subtitles = new VlcSubtitles(player.subtitles);
        /**
         * VLC Playlist control
         * @type {VlcPlaylist}
         */
        this.playlist = new VlcPlaylist(player.playlist);

        this._renderer = renderer;

        /**
         * Frame is set up
         * @event VlcPlayer#frameSetup
         * @param {int} uOffset
         * @param {int} vOffset
         * @param {int} width
         * @param {int} height
         * @param {('RV32'|'I420')} pixelFormat
         * @param {Uint8Array} videoFrame
         */
        player.onFrameSetup =
            (width, height, uOffset, vOffset, pixelFormat, videoFrame) => {
                this.input.width = width;
                this.input.height = height;
                this.input.uOffset = uOffset;
                this.input.vOffset = vOffset;
                this.emit('frameSetup', width, height, pixelFormat, videoFrame);
            }
        /**
         * Frame is ready
         * @event VlcPlayer#frameReady
         * @param {Uint8Array} videoFrame
         */
        player.onFrameReady = (videoFrame) => this.emit('frameReady', videoFrame);
        /**
         * Frame cleanup
         * @event VlcPlayer#frameCleanup
         */
        player.onFrameCleanup = () => this.emit('frameCleanup');
        /**
         * Media changed
         * @event VlcPlayer#mediaChange
         */
        player.onMediaChanged = () => this.emit('mediaChange');
        /**
         * VLC is in idle state doing nothing but waiting for a command to be issued.
         * @event VlcPlayer#idle
         */
        player.onNothingSpecial = () => this.emit('idle');
        /**
         * VLC is opening an media resource locator (MRL).
         * @event VlcPlayer#opening
         */
        player.onOpening = () => this.emit('opening');
        /**
         * VLC is buffering
         * @event VlcPlayer#buffering
         */
        player.onBuffering = (percents) => this.emit('buffering', percents);
        /**
         * State changed to playing
         * @event VlcPlayer#play
         */
        player.onPlaying = () => this.emit('play');
        /**
         * State changed to paused
         * @event VlcPlayer#pause
         */
        player.onPaused = () => this.emit('pause');
        /**
         * VLC is fastforwarding through the media (works only when an input supports forward playback).
         * @event VlcPlayer#forward
         */
        player.onForward = () => this.emit('forward');
        /**
         * VLC is going backwards through the media (works only when an input supports backwards playback).
         * @event VlcPlayer#backward
         */
        player.onBackward = () => this.emit('backward');
        /**
         * Encountered error
         * @event VlcPlayer#error
         */
        player.onEncounteredError = () => this.emit('error');
        /**
         * VLC has reached the end of current playlist.
         * @event VlcPlayer#ended
         */
        player.onEndReached = () => this.emit('ended');
        /**
         * Player stopped
         * @event VlcPlayer#stop
         */
        player.onStopped = () => this.emit('stop');
        /**
         * Time changed
         * @event VlcPlayer#timeChange
         * @param {int} time Milliseconds
         */
        player.onTimeChanged = (time) => this.emit('timeChange', time);
        /**
         * Position changed
         * @event VlcPlayer#positionChange
         * @param {number} position Position between 0 and 1
         */
        player.onPositionChanged = (position) => this.emit('positionChange', position);
        /**
         * Seekable changed
         * @event VlcPlayer#seekableChange
         * @param {boolean} seekable
         */
        player.onSeekableChanged = (seekable) => this.emit('seekableChange', seekable);
        /**
         * Pausable changed
         * @event VlcPlayer#pausableChange
         * @param {boolean} pausable
         */
        player.onPausableChanged = (pausable) => this.emit('pausableChange', pausable);
        /**
         * Duration changed
         * @event VlcPlayer#durationChange
         * @param {int} duration Milliseconds
         */
        player.onLengthChanged = (duration) => this.emit('durationChange', duration);
        /**
         * Log message event
         * @event VlcPlayer#message
         * @param {string} level Level of log message
         * @param {string} message
         * @param {string} format Format of log message
         */
        player.onLogMessage = (level, message, format) => this.emit('message', level, message, format);
    }

    /**
     * @param {Object} renderer Custom renderer using the same API as https://www.npmjs.com/package/wcjs-renderer
     */
    setRenderer(renderer) {
        this._renderer = renderer;
    }

    /**
     * Bind this player to a HTMLCanvasElement
     * @param {Element} canvas
     * @param {Object} options
     * @param {boolean} options.fallbackRenderer Boolean mentioning if the fallback non-WebGL renderer should be used (optional, defaults to false).
     * @param {boolean} options.preserveDrawingBuffer Boolean mentioning if we should preserve the drawing buffer (optional, defaults to false).
     * @param {function} options.onFrameSetup Will be called when VLC's onFrameSetup callback is called, with the same arguments, after the canvas has been setup.
     * @param {function} options.onFrameReady Will be called when VLC's onFrameReady callback is called, with the same arguments, after the frame has been rendered to the canvas.
     * @param {function} options.onFrameCleanup Will be called when VLC's onFrameCleanup callback is called, with the same arguments, after the frame was cleaned up.
     */
    bindCanvas(canvas, options = {}) {
        this._renderer.bind(canvas, this, options);
    }

    /**
     * Draws a single black frame on a canvas element (it's recommended to clear the canvas when the Media Changed and Ended events are triggered).
     * @param {Element} canvas
     */
    clearCanvas(canvas) {
        this._renderer.clear(canvas);
    }

    /**
     * The number of frames that were rendered in 1 seconds after the request was made (useful for performance tests and getting the current fps of a live stream as it normally returns as 0 with the WebChimera.js native method, to note: even when playback is paused it still renders at 10 fps).
     * @returns {Promise<number>}
     */
    getFps() {
        return new Promise(resolve => {
            this._renderer.getFps(resolve);
        })
    }

    /**
     * @returns {string}
     */
    get vlcVersion() {
        return this._player.vlcVersion;
    }

    /**
     * @returns {string}
     */
    get vlcChangeset() {
        return this._player.vlcChangeset;
    }

    /**
     * @returns {boolean}
     */
    get playing() {
        return this._player.playing;
    }

    /**
     * Duration in milliseconds
     * @returns {int}
     */
    get duration() {
        return this._player.length;
    }

    /**
     * Returns current state
     * @returns {("NothingSpecial"|"Opening"|"Buffering"|"Playing"|"Paused"|"Stopped"|"Ended"|"Error")}
     */
    get state() {
        return StateValues[this._player.state];
    }

    /**
     * Returns the current video frame
     * @returns {Uint8Array}
     */
    get videoFrame() {
        return this._player.videoFrame;
    }

    /**
     * @returns {('RV32'|'I420')}
     */
    get pixelFormat() {
        return PlayerPixelFormat[this._player.pixelFormat];
    }

    /**
     * @param {('RV32'|'I420')} format
     */
    set pixelFormat(format) {
        if (!PlayerPixelFormat.includes(format))
            throw new Error("PlayerPixelFormat should be one of " + PlayerPixelFormat.toString())
        this._player.pixelFormat = PlayerPixelFormat.indexOf(format);
    }

    /**
     * Current position [0-1] in timeline, can be used to seek
     * @returns {number}
     */
    get position() {
        return this._player.position;
    }

    /**
     * Current position [0-1] in timeline, can be used to seek
     * @param {number} position
     */
    set position(position) {
        /**
         * Seek
         * @event VlcPlayer#seek
         */
        this.emit('seek');
        this._player.position = position;
    }

    /**
     * Current time in milliseconds
     * @returns {int}
     */
    get time() {
        return this._player.time;
    }

    /**
     * Current time in milliseconds
     * @param {int} milliseconds
     */
    set time(milliseconds) {
        /**
         * Seek
         * @event VlcPlayer#seek
         */
        this.emit('seek');
        this._player.time = milliseconds;
    }

    /**
     * Volume percentage [0-200]
     * @returns {number}
     */
    get volume() {
        return this._player.volume;
    }

    /**
     * Volume percentage [0-200]
     * @param {number} volume
     */
    set volume(volume) {
        this._player.volume = Math.min(volume, 200);
    }

    /**
     * @returns {boolean}
     */
    get mute() {
        return this._player.mute;
    }

    /**
     * @param {boolean} mute
     */
    set mute(mute) {
        this._player.mute = mute;
    }

    /**
     * Play media using Media Resource Locator url
     * @param {string} mrl Media Resource Locator url
     */
    playUrl(mrl) {
        this._player.play(mrl);
    }

    play() {
        this._player.play();
    }

    pause() {
        this._player.pause();
    }

    togglePause() {
        this._player.togglePause();
    }

    stop() {
        this._player.stop();
    }

    toggleMute() {
        this._player.toggleMute();
    }

    close() {
        this._player.close();
    }
}

module.exports = VlcPlayer