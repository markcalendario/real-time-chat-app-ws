import React from 'react';
import { Container, Section, Wrapper } from './Base';
import { AiFillHome } from 'react-icons/ai';
import { FaSignOutAlt, FaUserFriends } from 'react-icons/fa';
import Cookies from 'universal-cookie';

export default function BottomConsole(props) {
	function handleSignOut() {
		const cookies = new Cookies();
		cookies.remove('access_token', { path: '/' });
		window.location.href = '/';
	}

	return (
		<Section id='bottom-console'>
			<Container>
				<Wrapper>
					<div
						onClick={() => {
							window.location.href = '/messages';
						}}
						className='bc-btn col-4'
					>
						<h5>
							<AiFillHome />
						</h5>
					</div>
					<div onClick={props.handleFindFriendsModalClick} className='bc-btn col-4 right'>
						<h5>
							<FaUserFriends />
						</h5>
					</div>
					<div onClick={handleSignOut} className='bc-btn col-4 right'>
						<h5>
							<FaSignOutAlt />
						</h5>
					</div>
				</Wrapper>
			</Container>
		</Section>
	);
}
