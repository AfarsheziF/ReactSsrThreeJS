import React from 'react';
import YouTubePlayer from 'youtube-player';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

import objects from '../../utils/objects'

var player, lastState, activeVideo,
    stateNames = {
        '-1': 'unstarted',
        0: 'ended',
        1: 'playing',
        2: 'paused',
        3: 'buffering',
        5: 'video cued'
    };

var artistId;

const VideoItem = (props) => {
    return (
        <Grid item xs={12}>
            <Button
                className="transitionAll"
                color={props.active ? "secondary" : "primary"}
                style={{ display: 'block' }}
                onClick={() => props.playThisVideo(props.item.id)}>
                <img src={props.item.imgSrc} className={"border pointer wpListImg" + (props.active ? " active" : "")} />
                <p className={"m-0" + (props.active ? " active" : "")}>{props.item.title}</p>
            </Button>
            {global.debug &&
                <div>
                    <input onChange={(evt) => artistId = evt.target.value}></input>
                    <button onClick={() => objects.addToArtistVideos(artistId, props.item)}>Add</button>
                </div>
            }
        </Grid>
    )
}

export default class YouTubePlayerCom extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showPlayer: false,
            wpList: []
        }
        this.isMuted = false;
    }

    componentDidMount() {
        this.loadPlayer();
    }

    componentDidUpdate() {
        console.log("YouTubePlayerCom componentDidUpdate", this.props.activeObject);
        if (this.props.activeObject &&
            this.props.activeObject.id &&
            this.props.activeObject.className &&
            this.props.activeObject !== this.state.activeObject) {
            if (this.props.activeObject.get('playList')) {
                this.getPlayList(this.props.activeObject.get('playList'));
            }
            if (this.props.activeObject.get('videos') && this.props.activeObject.get('videos').length > 0) {
                this.setState({
                    wpList: this.props.activeObject.get('videos'),
                    sendCallback: true
                });
                player.loadVideoById(this.props.activeObject.get('videos')[0].id)
            } else {
                this.setState({
                    wpList: [],
                    sendCallback: true
                });
            }
        }

        if (this.state.sendCallback) {
            this.setState({
                sendCallback: false,
                activeObject: this.props.activeObject
            })
            this.sendCallback();
        }
    }

    loadPlayer = () => {
        player = YouTubePlayer('player-1', {
            playerVars: {
                autoplay: 1,
                loop: 1,
                rel: 0,
                controls: 0,
                disablekb: 1,
                modestbranding: 1,
                showinfo: 0,
                iv_load_policy: 3,
                suggestedQuality: 'highres'
            }
        });
        player.mute();
        player.on('stateChange', this.onPlayerStateChange);
        player.muted = true;
        global.player = player;
        this.sendCallback()
    }

    onPlayerReady() {

    }

    onPlayerStateChange = (event) => {
        console.log('onPlayerStateChange: ' + stateNames[event.data] + ' (' + event.data + ').');
        const that = this;
        switch (event.data) {
            case -1:
                // checkLastState();
                break;

            case 0:
                this.getNextVideo();
                break;

            case 1:
                if (!this.state.showPlayer) {
                    this.setState({
                        showPlayer: true
                    })
                }
                player.getVideoUrl().then(
                    function (videoUrl) {
                        activeVideo = videoUrl.substring(videoUrl.indexOf("v=") + 2, videoUrl.length);
                        that.sendCallback(activeVideo);
                    }, function (e) {
                        console.log(e);
                    }
                )
                break;

            case 5:
                player.playVideo();
                this.getPlayListSnippets();
                break;
        }
        lastState = event.data;
        if (event.data !== 1) {
            this.sendCallback();
        }
    }

    mute() {
        if (player.muted) {
            player.unMute();
        } else {
            player.mute();
        }
        player.muted = !player.muted
        // this.sendCallback()
    }

    getPlayList = listId => {
        console.log("getPlayList", listId)
        player.cuePlaylist({
            listType: 'playlist',
            list: listId,
            index: 0,
            startSeconds: 0,
            suggestedQuality: 'highres'
        });
        this.setState({
            activeObject: this.props.activeObject
        })
    }

    getPlayListSnippets = () => {
        const that = this;
        if (!this.state.activeObject.get('savedPlayList')) {
            var wpList = [];
            player.getPlaylist().then(
                function (list) {
                    console.log("Getting playList Snippets from YouTube", list);
                    if (list && list.length > 0) {
                        for (var i = 0; i < list.length; i++) {
                            fetch('https://www.googleapis.com/youtube/v3/videos?id=' + list[i] + '&key=AIzaSyCj1z43juAsN2MQYbbW8F1nddds5Z8Ofns&fields=items(id,snippet(channelId,title,categoryId))&part=snippet')
                                .then(res => res.json())
                                .then(
                                    (data) => {
                                        if (data.items) {
                                            wpList.push({
                                                id: data.items[0].id,
                                                title: data.items[0].snippet.title,
                                                imgSrc: 'http://img.youtube.com/vi/' + data.items[0].id + '/hqdefault.jpg'
                                            });
                                        }
                                        that.setState({
                                            wpList: wpList
                                        })
                                        that.state.activeObject.set('savedPlayList', wpList);
                                        that.state.activeObject.save();
                                    },
                                    (e) => {
                                        console.log(e);
                                    }
                                )
                        }
                    }
                }, function (e) {
                    console.log(e);
                }
            );
        } else {
            this.setState({
                wpList: this.state.activeObject.get('savedPlayList')
            })
        }
    }

    playThisVideo = videoId => {
        player.loadVideoById(videoId);
    }

    getNextVideo = () => {
        if (activeVideo && this.state.wpList &&
            this.state.wpList.length > 0) {
            var index = 0;
            for (var i in this.state.wpList) {
                if (this.state.wpList[i].id === activeVideo) {
                    index = i;
                    break;
                }
            }
            if (index < (this.state.wpList.length - 1)) {
                index++;
            } else {
                index = 0;
            }
            this.playThisVideo(this.state.wpList[index].id);
        } else {
            player.playVideo();
        }
    }

    sendCallback = () => {
        var wpList = this.state.wpList;
        console.log("sendCallback wpList:", wpList);
        var listView = [];
        var col = wpList.length > 1 ? 6 : 12;
        for (var i in wpList) {
            listView.push(
                <Grid item md={col} xs={12} key={i}>
                    <VideoItem
                        active={activeVideo && activeVideo === wpList[i].id}
                        item={wpList[i]}
                        playThisVideo={this.playThisVideo}>
                    </VideoItem>
                </Grid>)
        }

        this.props.callback({
            loaded: true,
            mute: player.muted,
            state: stateNames[lastState],
            playList: this.state.playList,
            wpList: listView,
            showVideos: wpList.length > 0,
            activeVideo: activeVideo
        });
    }

    render() {
        return (
            <div className={"transitionAll " + (this.state.showPlayer ? "show" : "hide")}
                style={{ zIndex: -1 }}>
                <div id='player-1' className={"player"}></div>
            </div>
        )
    }
}