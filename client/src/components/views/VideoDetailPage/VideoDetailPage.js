import React, { useEffect, useState } from 'react'
import { Row, Col, List, Avatar } from 'antd';
import Axios from 'axios';
import SideVideo from './Sections/SideVideo';
import Subscribe from './Sections/Subscribe';
import LikeDislikes from './Sections/LikeDislikes';
import Comment from './Sections/Comment';

function VideoDetailPage(props) {

    const videoId = props.match.params.videoId // url로 넘겨준 videoId를 가져옴
    const variable = { videoId: videoId }

    const [Video, setVideo] = useState([])
    const [Comments, setComments] = useState([])

    useEffect(() => {

        Axios.post('/api/video/getVideoDetail', variable)
            .then(response => {
                if(response.data.success) {
                    setVideo(response.data.videoDetail)
                } else {
                    alert('비디오 정보 가져오기 실패')
                }
            })

        Axios.post('/api/comment/getComments', variable)
            .then(response => {
                if(response.data.success) {
                    // console.log("#댓 목록 : ", response.data.comments)
                    setComments(response.data.comments)
                } else {
                    alert('Comment 정보를 가져오는 데 실패했습니다.')
                }
            }) 
        
    }, [])


    const refreshFunction = (newComment) => {
        setComments(Comments.concat(newComment))
    };

    
    if (Video.writer) {
        return (
            <Row>
                <Col lg={18} xs={24}>
                    <div style={{ width: '100%', padding: '3rem 4rem'}}>
                        <video style={{ width: '100%' }} src={`http://localhost:5000/${Video.filePath}`} controls />
                        <List.Item
                            actions={Video.writer._id === localStorage.getItem('userId') ? [''] : [<LikeDislikes video userId={localStorage.getItem('userId')} videoId={videoId} />, <Subscribe userTo={Video.writer._id} userFrom={localStorage.getItem('userId')} />]} 
                            // 구독 버튼
                            // 로그인을 하면 브라우저의 local Storage에 userId가 저장됨
                        >
                            <List.Item.Meta
                                avatar={Video.writer && <Avatar src={Video.writer.image} />}
                                title={Video.title}
                                description={Video.description}
                            />

                        </List.Item>

                        {/* comments */}
                        <Comment refreshFunction={refreshFunction} commentLists={Comments} videoId={videoId} />

                    </div>

                </Col>
                <Col lg={6} xs={24}>
                    <SideVideo />
                </Col>
            </Row>
        )
    } else {
        return (
            <div>Loading...</div>
        )
    }
    
}

export default VideoDetailPage
