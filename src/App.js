import React, { Component } from 'react';

class App extends Component {
  constructor(props) {
      super(props);

      this.localVideoRef = React.createRef();
      this.remoteVideoRef = React.createRef();
  }

  componentDidMount() {
      const pc_config = null;

      // const pc_config = {
      //     iceServers: [
      //             {
      //                 urls: 'stun:[STUN_IP]:[PORT]', e.g. ['stun:stun.l.google.com:19302']
      //                 credential: '[YOUR CREDENTIAL]',
      //                 username: '[USERNAME]'
      //             }
      //         ]
      // };

      this.pc = new RTCPeerConnection(pc_config);
      this.pc.onicecandidate = e => {if (e.candidate) console.log(JSON.stringify(e.candidate))};
      this.pc.onconnectionstatechange = e => console.log(e);
      this.pc.onaddstream = e => this.remoteVideoRef.current.srcObject = e.stream;

      const constraints = {video: true};
      const success = stream => {
          window.localStream = stream;
          this.localVideoRef.current.srcObject = stream;
          this.pc.addStream(stream);
      };
      const failure = error => {
          console.log('getUserMedia error: ', error);
      };
      (async () => {
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          success(stream);
      })().catch(failure);
  }

  createOffer = () => {
      console.log('offer');
      this.pc.createOffer({offerToReceiveVideo: 1})
          .then(sdp => {
              console.log(JSON.stringify(sdp));
              this.pc.setLocalDescription(sdp);
          }, e => {});
  };

  setRemoteDescription = () => {
      const desc = JSON.parse(this.textRef.value);
      this.pc.setRemoteDescription(new RTCSessionDescription(desc));
  };

  createAnswer = () => {
      console.log('answer');
      this.pc.createAnswer({offerToReceiveVideo: 1})
          .then(sdp => {
              console.log(JSON.stringify(sdp));
              this.pc.setLocalDescription(sdp);
          }, e => {});
  };

  addCandidate = () => {
      const candidate = JSON.parse(this.textRef.value);
      console.log('adding candidate: ', candidate);
      this.pc.addIceCandidate(new RTCIceCandidate(candidate));
  };

  render() {
      return (
          <div>
              <video
                style={{
                    width: 240,
                    height: 240,
                    margin: 5,
                    backgroundColor: 'black'
                }}
                ref={this.localVideoRef}
                autoPlay
                />
              <video
                style={{
                    width: 240,
                    height: 240,
                    margin: 5,
                    backgroundColor: 'black'
                }}
                ref={this.remoteVideoRef}
                autoPlay
                />

              <br/>
              <button onClick={this.createOffer}>Offer</button>
              <button onClick={this.createAnswer}>Answer</button>
              <br/>
              <textarea ref={ref => {this.textRef = ref}} />
              <br/>
              <button onClick={this.setRemoteDescription}>Set Remote Desc</button>
              <button onClick={this.addCandidate}>Add Candidate</button>
          </div>
      );
  };
}

export default App;
