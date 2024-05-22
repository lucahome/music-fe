import React, { } from 'react';
import Card from '../components/Card';

const Index = () => {
    const musicData = {
        id: 1,
        title: 'Lời yêu thương',
        artist: 'Người gửi',
        thumbnail: require('../assets/images/img01.jpg'),
        src: null
    }

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

export default Index;