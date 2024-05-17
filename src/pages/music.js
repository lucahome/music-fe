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
            const isExistAudio = async (musicId) => {
                let response = {
                    isExist: false,
                    data: null
                }
                try {
                    const getDB = window.indexedDB.open('audioDB', 1);
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
                        console.log('isExistAudio ~ getRequest:', getRequest);
                        getRequest.onerror = (event) => {
                            console.error('Error checking file existence:', event.target.error);
                        };
                        getRequest.onsuccess = (event) => {
                            console.log('success check isExistAudo');
                            const audioData = event.target.result;
                            const audioBlob = new Blob([audioData], { type: 'audio/mpeg' });
                            const audioUrl = URL.createObjectURL(audioBlob);

                            response.isExist = true;
                            response.data = audioUrl;
                        };
                    };
                } catch (error) {
                    console.log(`[ERROR] => fn isExistAudio -- ${error.message} -- ${JSON.stringify(error)}`);
                }
                return response;
            }

            const saveAudio = async (musicId, src) => {
                let responseData = {
                    isSaved: false,
                    data: null
                }
                try {
                    const response = await fetch(src);
                    const blob = await response.blob();

                    // Mở kết nối với IndexedDB
                    const request = window.indexedDB.open('audioDB', 1);
                    request.onerror = (event) => {
                        console.error('IndexedDB error:', event.target.error);
                    };
                    request.onsuccess = (event) => {
                        const db = event.target.result;
                        const transaction = db.transaction(['audioStore'], 'readwrite');
                        const objectStore = transaction.objectStore('audioStore');

                        // Lưu trữ Blob trong IndexedDB
                        const addRequest = objectStore.add({ musicId: musicId, value: blob });
                        addRequest.onerror = (event) => {
                            console.error('Error adding audio file to IndexedDB:', event.target.error);
                        };
                        addRequest.onsuccess = (event) => {
                            responseData.isSaved = true;
                            responseData.data = src;
                        };
                    };
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

                        const checkExist = await isExistAudio(musicData.id);

                        if (checkExist.isExist) {
                            src = isExistAudio.src;
                        } else {
                            const saveResult = await saveAudio(musicData.id, src);
                            if (saveResult.isSaved) {
                                src = saveResult.data
                            }
                        }

                        musicData.src = src;
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