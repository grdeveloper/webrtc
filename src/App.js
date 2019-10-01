import React, { Component } from 'react';
import './App.css';
import openSocket from 'socket.io-client';

class App extends Component {
  constructor(props) {
      super(props);

      this.candidate = null;
      this.localVideoRef = React.createRef();
      this.remoteVideoRef = React.createRef();
      this.socket = openSocket('http://localhost:3000');
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
      this.pc.onicecandidate = e => {if (e.candidate && !this.candidate) this.candidate = e.candidate;};
      this.pc.onconnectionstatechange = e => console.log('onconnectionstatechange fired', e);
      this.pc.onaddstream = e => this.remoteVideoRef.current.srcObject = e.stream;

      const constraints = {video: true, audio: false};
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

      this.socket.on('offered', desc => {
          console.log('offer came');
          this.pc.setRemoteDescription(new RTCSessionDescription(desc));
          this.pc.createAnswer({offerToReceiveVideo: 1, offerToReceiveAudio: 1})
              .then(sdp => {
                  console.log(JSON.stringify(sdp));
                  this.pc.setLocalDescription(sdp);
                  this.socket.emit('answer', sdp);
                  console.log('answer send');
              }, e => {});
      });

      this.socket.on('answered', desc => {
          console.log('answer received');
          this.pc.setRemoteDescription(new RTCSessionDescription(desc));
          this.socket.emit('candidate', this.candidate);
          console.log('candidate sent');
      });

      this.socket.on('candidated', candidate => {
          console.log('candidate received', candidate);
          this.pc.addIceCandidate(new RTCIceCandidate(candidate));
      });

      this.socket.on('hangup', () => {
          this.remoteVideoRef.current.srcObject = null;
          this.pc.close();
          this.pc.onicecandidate = null;
          this.pc.onconnectionstatechange = null;
          this.pc.onaddstream = null;
          window.localStream = null;
      });
  }

  createOffer = () => {
      console.log('offer');
      this.pc.createOffer({offerToReceiveVideo: 1, offerToReceiveAudio: 1})
          .then(sdp => {
              console.log(JSON.stringify(sdp));
              this.pc.setLocalDescription(sdp);
              this.socket.emit('offer', sdp);
          }, e => {});
  };

  hangUp = () => {
      this.socket.emit('hangup');
  };

  render() {
      return (
          <div className='webrtc'>
              <video
                ref={this.localVideoRef}
                autoPlay
                />
              <video
                ref={this.remoteVideoRef}
                autoPlay
                />
              <br/>
              <button onClick={this.createOffer}>Call</button>
              <button onClick={this.hangUp}>Hang Up</button>
          </div>
      );
  };
}

export default App;
