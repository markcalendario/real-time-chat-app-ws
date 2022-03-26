import React from 'react';
import { Container, Section, Wrapper } from './Base';
import { AiFillHome } from 'react-icons/ai';
import { FaUserFriends } from 'react-icons/fa';
export default function BottomConsole() {
	return (
		<Section id='bottom-console'>
			<Container>
				<Wrapper>
					<div
						onClick={() => {
							window.location.href = '/messages';
						}}
						className='bc-btn col-6'
					>
						<h5>
							<AiFillHome />
						</h5>
					</div>
					<div className='bc-btn col-6 right'>
						<h5>
							<FaUserFriends />
						</h5>
					</div>
				</Wrapper>
			</Container>
		</Section>
	);
}
