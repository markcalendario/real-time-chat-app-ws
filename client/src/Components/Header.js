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

export function ChattingHead() {
	return (
		<div className='chatting-head'>
			<div className='profile'>
				<img
					src='https://pbs.twimg.com/profile_images/676973135695101952/bwK_jiRb_400x400.jpg'
					alt='Name'
				/>
			</div>

			<h4>Mia Suarez</h4>
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
						<img
							src='https://preview.redd.it/iu95t4mbgf581.jpg?width=640&crop=smart&auto=webp&s=dba0a7aa38e8a7da5ea87c8decb32c9e07832581'
							alt='Profile'
						/>
					</div>
				</Wrapper>
			</Container>
		</Section>
	);
}
