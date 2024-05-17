import React, { useState, useEffect, useRef } from 'react';
import '../assets/css/card.css';
import { timer } from '../utils/timer'
import { visualizer } from '../utils/visualizer';

const Card = ({ props: { musicData } }) => {
    const [duration, setDuration] = useState(1)
    const [currentTime, setCurrentTime] = useState(0)
    const [play, setPlay] = useState(false)
    const [showVolume, setShowVolume] = useState(false)
    const [volume, setVolume] = useState(50)
    const [repeat, setRepeat] = useState('repeat');

    const audioRef = useRef();
    const canvasRef = useRef();

    const handleLoadStart = (e) => {
        setDuration(audioRef.current.duration)

        // const src = e.nativeEvent.srcElement.src;
        // const audio = new Audio(src);
        // audio.onloadeddata = () => {
        //     console.log(audio);
        //     if (audio.readyState > 0) {
        //         setDuration(audio.duration)
        //     }
        // }

        if (play) { audioRef.current.play() }
    }

    const handlePlayingAudio = () => {
        visualizer(audioRef.current, canvasRef.current, play)
        if (play) {
            audioRef.current.pause();
            setPlay(false)
        } else {
            audioRef.current.play();
            setPlay(true)
        }
    }

    const handleTimeUpdate = () => {
        const currentTime = audioRef.current.currentTime;
        setCurrentTime(currentTime)
    }

    const changeCurrentTime = (e) => {
        const currentTime = Number(e.target.value);
        audioRef.current.currentTime = currentTime;
        setCurrentTime(currentTime)
    }

    const handleNextPrev = (n) => {
        const currentTime = audioRef.current.currentTime;
        if (n > 0) {
            audioRef.current.currentTime = currentTime + 5
        } else {
            audioRef.current.currentTime = currentTime - 5
        }
    }

    useEffect(() => {
        audioRef.current.volume = volume / 100;
    }, [volume]);

    const handleRepeat = () => {
        setRepeat(value => {
            switch (value) {
                case 'repeat':
                    return 'repeat_one';
                case 'repeat_one':
                    return 'repeat';

                default:
                    return 'repeat';
            }
        });
    }

    const endedAudio = () => {
        switch (repeat) {
            case 'repeat_one':
                return audioRef.current.play();
            case 'repeat': {
                audioRef.current.pause();
                setPlay(false);
                setCurrentTime(0);
                break;
            }
            default:
                break;
        }
    }

    return (
        <div className='card'>
            <div className='nav'>
                <i className="material-icons">expand_more</i>
                <div className='marquee'>
                    <span className='title'>{musicData.title} </span>
                    <span className='duplicate-title'>{musicData.title} </span>
                </div>
                <i className="material-icons">queue_music</i>
            </div>

            <div className='img'>
                <img src={musicData.thumbnail} alt=''
                    className={`${play ? 'playing' : ''}`}
                />
                <canvas ref={canvasRef} />
            </div>

            <div className='details'>
                <p className='title'>{musicData.title}</p>
                <p className='artist'>{musicData.artist}</p>
            </div>

            <div className='progress'>
                <input type='range' min={0} max={duration}
                    value={currentTime} onChange={e => changeCurrentTime(e)}
                    style={{
                        background: `linear-gradient(to right, #3264fe ${currentTime / duration * 100}%, #e5e5e5 ${currentTime / duration * 100}%)`
                    }}
                />
            </div>

            <div className='timer'>
                <span>{timer(currentTime)}</span>
                <span>{timer(duration)}</span>
            </div>

            <div className='controls'>
                <i className="material-icons" onClick={handleRepeat}>
                    {repeat}
                </i>

                <i className="material-icons" id='prev'
                    onClick={() => handleNextPrev(-1)}
                >replay_5</i>

                <div className='play' onClick={handlePlayingAudio}>
                    <i className="material-icons">
                        {play ? 'pause' : 'play_arrow'}
                    </i>
                </div>

                <i className="material-icons" id='next'
                    onClick={() => handleNextPrev(1)}
                >forward_5</i>

                <i className='material-icons' onClick={() => setShowVolume(prev => !prev)} >volume_up</i>

                <div className={`volume ${showVolume ? 'show' : ''}`}>
                    <i className='material-icons' onClick={() => setVolume(v => v > 0 ? 0 : 100)}>
                        {volume === 0 ? 'volume_off' : 'volume_up'}
                    </i>
                    <input type='range' min={0} max={100}
                        onChange={e => setVolume(Number(e.target.value))}
                        style={{
                            background: `linear-gradient(to right, #3264fe ${volume}%, #e5e5e5 ${volume}%)`
                        }}
                    />

                    <span>{volume}</span>
                </div>
            </div>

            <audio
                src={musicData.src}
                hidden ref={audioRef}
                onLoadedData={handleLoadStart}
                onTimeUpdate={handleTimeUpdate}
                crossOrigin='anonymous'
                onEnded={endedAudio}
            />
        </div>
    )
}

export default Card;