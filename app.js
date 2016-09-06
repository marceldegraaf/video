//
// Video Recorder Container
//
var Video = React.createClass({
  getInitialState: function() {
    return {
      recorder: null,
      playbackURL: null,
      downloadURL: null,
      fileName: null,
      chunks: [],
      recording: false,
      settings: {"audio": true, "video": { "mandatory": { "minWidth": 640, "maxWidth": 640, "minHeight": 480,"maxHeight": 480 }, "optional": [] } }
    }
  },

  render: function() {
    return(
      <div className="video-container">
        <Preview url={this.state.playbackURL} recording={this.state.recording} />
        <Record onClickedHandler={this.startRecording} recording={this.state.recording} />
        <Stop onClickedHandler={this.stopRecording} recording={this.state.recording} />
        <Play onClickedHandler={this.playRecording} recording={this.state.recording} url={this.state.playbackURL} />

        <Download name={this.state.fileName} url={this.state.downloadURL} onClickedHandler={this.downloadRecording} recording={this.state.recording} />
      </div>
    )
  },

  componentDidMount: function() {
    console.debug("Mounted video component")
  },

  startRecording: function() {
    console.debug("Starting recording")

    // Start a recording. This propmpts for
    // access to the camera and microphone.
    //
    // NOTE: Only supports Chrome!
		navigator.webkitGetUserMedia(
      this.state.settings,
      this.recordCallback,
      this.recordErrorCallback);
  },

  recordCallback: function(stream) {
    // NOTE: Only supports Chrome!
    var options = { mimeType: 'video/webm;codecs=vp9' }

    // Initialize the recorder
    var recorder = new MediaRecorder(stream, options)
    this.setState({recorder: recorder})

    // Start recording
    this.state.recorder.start(10);

    // Callback: onDataAvailable
	  this.state.recorder.ondataavailable = function(event) {
      this.state.chunks.push(event.data)
    }.bind(this)

    // Callback: onStop
	  this.state.recorder.onstop = function(event) {
		  var blob = new Blob(this.state.chunks, {type: "video/webm"});
      this.setState({chunks: []})

      // Generate download/playback URL
      var url = window.URL.createObjectURL(blob)

      // Generate a file name
      var rand = Math.floor((Math.random() * 10000000))
      var name = "videopoc_" + rand + ".webm"

      this.setState({downloadURL: url, playbackURL: url, fileName: name})

    }.bind(this)

    // Set the recording URL to start simultaneous
    // playback in the preview window
    this.setState({playbackURL: window.URL.createObjectURL(stream), recording: true})
  },

  recordErrorCallback: function(error) {
    console.error("Error while recording", error)
  },

  stopRecording: function() {
    console.debug("Stopping recording")

    this.state.recorder.stop()
    this.setState({recording: false})
  },

  playRecording: function() {
    document.getElementById("video-preview").play()
    document.getElementById("video-preview").controls = true
  }
})

//
// Preview window
//
var Preview = React.createClass({
  getInitialState: function() {
    return {playing: false}
  },

  render: function() {
    return(
      <div className="video-preview">
        <video id="video-preview" src={this.props.url}></video>
      </div>
    )
  },

  componentDidUpdate: function() {
    if(this.props.recording && !this.state.playing) {
      document.getElementById("video-preview").play()
      document.getElementById("video-preview").controls = false
      this.setState({playing: true})
    }

    if(!this.props.recording && this.state.playing) {
      this.setState({playing: false})
    }
  }
})

//
// Record button
//
var Record = React.createClass({
  render: function() {
    var disabled = this.props.recording ? "disabled" : ""

    return(
      <button disabled={disabled} className="record" onClick={this.handleClick.bind(this)}>Record</button>
    )
  },

  handleClick: function(event) {
    this.props.onClickedHandler()
  }
})

//
// Stop button
//
var Stop = React.createClass({
  render: function() {
    var disabled = this.props.recording ? "" : "disabled"

    return(
      <button disabled={disabled} className="stop" onClick={this.handleClick.bind(this)}>Stop</button>
    )
  },

  handleClick: function(event) {
    this.props.onClickedHandler()
  }
})

//
// Play button
//
var Play = React.createClass({
  render: function() {
    var disabled = "disabled"

    if(!this.props.recording && this.props.url) { disabled = "" }

    return(
      <button disabled={disabled} className="play" onClick={this.handleClick.bind(this)}>Play</button>
    )
  },

  handleClick: function(event) {
    this.props.onClickedHandler()
  }
})

//
// Download link
//
var Download = React.createClass({
  render: function() {
    if(this.props.url && !this.props.recording) {
      return(
        <p>
          <a href={this.props.url} className="download" download={this.props.name} name={this.props.name}>Download your recording</a>
        </p>
      )
    } else {
      return(<p></p>)
    }
  }
})

ReactDOM.render(
  <Video />,
  document.getElementById("app")
)
