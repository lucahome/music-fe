/* eslint-disable no-use-before-define */
import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const Music = () => {
    const { musicId } = useParams();
    const navigate = useNavigate();

    const [musicData, setMusicData] = useState([]);


    useEffect(() => {
        if (!musicId) navigate('/');
        else {
            const isExistData = async (musicId) => {
                let response = {
                    isExist: false,
                    musicData: null,
                    imageData: null
                }
                try {
                    const getDB = window.indexedDB.open('audioDB', 1);

                    return new Promise((resolve, reject) => {
                        getDB.onerror = (event) => {
                            console.error('IndexedDB error:', event.target.error);
                        };
                        getDB.onupgradeneeded = function (event) {
                            const db = event.target.result;
                            if (!db.objectStoreNames.contains('audioStore')) {
                                db.createObjectStore('audioStore', { keyPath: 'musicId' });
                            }
                        };
                        getDB.onsuccess = (event) => {
                            const db = event.target.result;
                            const transaction = db.transaction(['audioStore'], 'readonly');
                            const objectStore = transaction.objectStore('audioStore');

                            // Kiểm tra xem tệp có tồn tại trong IndexedDB không
                            const getRequest = objectStore.get(musicId);
                            getRequest.onerror = (event) => {
                                console.error('Error checking file existence:', event.target.error);
                            };
                            getRequest.onsuccess = (event) => {
                                const audioData = event.target.result;
                                if (audioData) {
                                    const audioBlob = new Blob([audioData.musicData], { type: 'audio/mpeg' });
                                    const audioUrl = URL.createObjectURL(audioBlob);

                                    const imageUrl = URL.createObjectURL(audioData.imageData)

                                    response.isExist = true;
                                    response.musicData = audioUrl;
                                    response.imageData = imageUrl;
                                }

                                resolve(response);
                            };
                        };
                    });

                } catch (error) {
                    console.log(`[ERROR] => fn isExistAudio -- ${error.message} -- ${JSON.stringify(error)}`);
                }
                return response;
            }

            const saveData = async (musicId, src, thumbnail) => {
                let responseData = {
                    isSaved: false,
                    musicData: null,
                    imageData: null,
                }
                try {
                    // nhận data âm thanh
                    const response = await fetch(src);
                    const blob = await response.blob();

                    // nhận data hình thumbnail
                    const responseImage = await fetch(thumbnail);
                    const blobImage = await responseImage.blob();

                    // Mở kết nối với IndexedDB
                    const request = window.indexedDB.open('audioDB', 1);

                    return new Promise((resolve, reject) => {
                        request.onerror = (event) => {
                            console.error('IndexedDB error:', event.target.error);
                        };
                        request.onsuccess = (event) => {
                            const db = event.target.result;
                            const transaction = db.transaction(['audioStore'], 'readwrite');
                            const objectStore = transaction.objectStore('audioStore');

                            // Lưu trữ Blob trong IndexedDB
                            const addRequest = objectStore.add({ musicId: musicId, musicData: blob, imageData: blobImage });
                            addRequest.onerror = (event) => {
                                console.error('Error adding audio file to IndexedDB:', event.target.error);
                            };
                            addRequest.onsuccess = (event) => {
                                responseData.isSaved = true;
                                responseData.musicData = src;
                                responseData.imageData = thumbnail;

                                resolve(responseData);
                            };
                        };
                    });
                } catch (error) {
                    console.log(`[ERROR] => fn saveAudio -- ${error.message} -- ${JSON.stringify(error)}`);
                }

                return responseData;
            }

            const fetchMusicData = async (musicId) => {
                try {
                    let musicResult = await axios.get(`${process.env.REACT_APP_URL_BACKEND || 'http://localhost:3002'}/music/${musicId}`, {}, { timeout: 60000 });
                    musicResult = musicResult?.data;
                    if (musicResult?.code === 1000) {
                        const musicData = musicResult?.data;

                        let src = musicData.src;
                        let thumbnail = musicData.thumbnail;

                        const checkExist = await isExistData(musicData.id);

                        if (checkExist.isExist) {
                            src = checkExist.musicData;
                            thumbnail = checkExist.imageData;
                        } else {
                            const saveResult = await saveData(musicData.id, src, thumbnail);
                            if (saveResult.isSaved) {
                                src = saveResult.musicData;
                                thumbnail = saveResult.imageData;
                            }
                        }

                        musicData.src = src;
                        musicData.thumbnail = thumbnail;
                        setMusicData(musicData);
                    } else {
                        navigate('/');
                    }
                } catch (error) {
                    console.log(`ERROR when call get music data ${error.message} -- ${JSON.stringify(error)}`);
                }
            }

            fetchMusicData(musicId);
        }
    }, [musicId, navigate]);

    return (
        <div className='container'>
            <div className='shape shape-1'></div>
            <div className='shape shape-2'></div>
            <div className='shape shape-3'></div>

            <main>
                <Card props={{ musicData }} />
            </main>
        </div>
    )
}

export default Music;