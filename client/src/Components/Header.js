import React from 'react';
import { Container, Section, Wrapper } from './Base';

export function LargeScreenHeaderFront() {
	return (
		<Section id='ls-header-f'>
			<Container>
				<Wrapper>
					<div
						onClick={() => {
							window.location.href = '/';
						}}
						className='logo'
					>
						<img src={require('../assets/logo.png')} alt='Logo' />
						<h3 className='text'>Messenger.</h3>
					</div>
				</Wrapper>
			</Container>
		</Section>
	);
}

export function ChattingHead(props) {
	return (
		<div className='chatting-head'>
			<div className='profile'>
				<img src={require('../assets/egg2.jpg')} alt='Name' />
			</div>

			<h4>{props.fullName}</h4>
		</div>
	);
}

export function MobileLoggedInHeader(props) {
	return (
		<Section id='mb-logged-in-header'>
			<Container>
				<Wrapper>
					<div className='logo'>
						<img src={require('../assets/logo.png')} alt='Logo' />
					</div>
					<div className='logo-text'>
						<h4>Messenger.</h4>
					</div>
					<div className='profile'>
						<img src={require('../assets/egg.jpg')} alt='Profile' />
					</div>
				</Wrapper>
			</Container>
		</Section>
	);
}
