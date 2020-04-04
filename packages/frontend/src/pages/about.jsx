import React from 'react'

const About = () => {
  return (
    <div className='content'>
      <h1>Hi there, let's grab some Hojicha</h1>
      <h3>What is this?</h3>
      <p>
        This is a forum that allows you to publish message without showing who
        you are. You are anonymous not only to public but also to the server
        hosting this forum.
      </p>
      <h3>How it works?</h3>
      <p>
        The server authenticates a user by verifying a Zero Knowledge Proof they
        sent.
      </p>
      <h3>Learn more and contributing</h3>
      <p>
        Please visit the{' '}
        <a
          href='https://github.com/ChihChengLiang/semaphore_auth'
          target='_blank'
        >
          Github
        </a>{' '}
        page.
      </p>
    </div>
  )
}

export default About
