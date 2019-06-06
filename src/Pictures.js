import apiUrl from './apiConfig'
import React, { Component } from 'react'
import axios from 'axios'
import { Link, withRouter } from 'react-router-dom'
import Card from 'react-bootstrap/Card'
import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'
import Button from 'react-bootstrap/Button'

const moment = require('moment')

class Pictures extends Component {
  constructor (props) {
    super(props)

    this.state = {
      pictures: [],
      comment: '',
      liked: false,
      users: []
    }
  }

  currentUserInfo = this.props.user

  async componentDidMount () {
    const response = await axios(`${apiUrl}/uploads`)
    this.setState({ pictures: response.data.uploads })
    const userResponse = await axios(`${apiUrl}/users`)
    this.setState({ users: userResponse.data.users })
    console.log(userResponse)
  }

  toggleLike = () => this.setState(prevState => {
    return { liked: !prevState.liked }
  })

  handleChange = event => {
  // handle change
    const updatedField = {
      [event.target.name]: event.target.value
    }
    const comment = Object.assign(this.state.comment, updatedField)
    console.log(comment)
    this.setState({ comment: comment.comment })
  }
  createComment = async event => {
    event.preventDefault()
    const id = event.target.id
    console.log(id)
    console.log(this.state.comment)
    console.log(this.props)
    await axios({
      url: apiUrl + '/comments',
      method: 'POST',
      headers: { Authorization: 'Token token=' + this.props.user.token },
      data: {
        comment: {
          'picture': `${id}`,
          'text': `${this.state.comment}`,
          'username': `${this.props.user._id}`
        }
      }
    })
    this.componentDidMount()
  }

  smashThatLike = async event => {
    this.toggleLike()
    const id = event.target.id
    await axios({
      url: apiUrl + `/likes/${id}`,
      method: 'PATCH',
      headers: { Authorization: 'Token token=' + this.props.user.token },
      data: {
        upload: {
          likes: this.props.user.username || this.props.user._id
        } }
    })
    this.componentDidMount()
  }

  render () {
    const currentUser = (
      <div>
        <span>
          {this.props.user ? <img src={this.props.user.profile} className="avatar-pictures"/> : ''}
          {this.props.user ? <p className="sidebar-p-span">{ this.props.user.username || this.props.user.email}</p> : ''}
        </span>
      </div>
    )

    const users = this.state.users.reverse().map(user => (
      <div key={user._id} className="sidebar-container">
        <Link to={'/profile/' + user._id}><Card.Img src={user.profile} className="avatar-pictures"/></Link>
        <div>
          <Link to={'/profile/' + user._id}><p className="sidebar-small">{user.username || user.email}</p></Link>
          <p className="sidebar-super-small">{moment(user.updatedAt).fromNow()}</p>
        </div>
      </div>
    ))
    const pictures = this.state.pictures.filter(function (pic) {
      return pic.description !== 'Profile'
    }).reverse().map(picture => (
      <Card key={picture._id} className="card">
        <Card.Header className="card-header">
          <Link to={'/profile/' + picture.owner._id}><Card.Img src={picture.owner.profile} className="avatar-pictures"/></Link>
          <Link to={'/profile/' + picture.owner._id} className="nohover"><p className="card-picture-p">{picture.owner.username || 'unknown'}</p></Link></Card.Header>
        <Link to={'/uploads/' + picture._id}><Card.Img variant="top" src={picture.url} /></Link>
        <Card.Footer>
          { this.props.user ? (picture.likes.includes(this.props.user.username)
            ? <Card.Img className="duck-like" src='https://i.imgur.com/1gqZnEN.png'
              onClick={this.smashThatLike} id={picture._id}/>
            : <Card.Img className="duck-like" src="https://i.imgur.com/nWCiT5Z.png"
              onClick={this.smashThatLike} id={picture._id}/>) : '' }
          <Card.Text>liked by <b>{picture.likes.length}</b> ducks</Card.Text>
          <Card.Text className="picture-description"><b>@{picture.owner.username || 'unknown'} - </b>{picture.title || picture.description} #{picture.tag || 'notags'}</Card.Text>
          {picture.comments.map(comment =>
            <Card.Text key={comment._id} className="picture-description"><b>{comment.owner.username || comment.owner._id} - </b>{comment.text}</Card.Text>
          )}
          <Card.Text><small className="text-muted">{moment(picture.createdAt).fromNow()}</small></Card.Text>
        </Card.Footer>
        {this.props.user ? <Card.Footer>
          <InputGroup className="mb-3">
            <FormControl className="form-border"
              name="comment"
              placeholder="Add a comment..."
              aria-label="Recipient's username"
              aria-describedby="basic-addon2"
              onChange={this.handleChange}/>
            <InputGroup.Append>
              <Button id={picture._id} className="comment-button" onClick={this.createComment}>Post</Button>
            </InputGroup.Append>
          </InputGroup>
        </Card.Footer>
          : '' }
      </Card>
    ))

    return (
      <div>
        <div className="sidebar-user">
          {currentUser}
        </div>
        <div className={this.props.user ? 'sidebar-div' : 'sidebar-userless'}>
          <Card className="sidebar-card">
            <Card.Header>users</Card.Header>
            {users}
          </Card>
        </div>
        <div className="pictures">
          <h5>Total images: {pictures.length}</h5>
        </div>
        <ol>
          {pictures}
        </ol>
      </div>
    )
  }
}

export default withRouter(Pictures)
