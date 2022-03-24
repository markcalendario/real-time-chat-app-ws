import React, { Fragment } from 'react';
import { Container, Section, Wrapper } from '../Components/Base';
import BottomConsole from '../Components/BottomConsole';
import { SearchBar } from '../Components/Forms';
import { ChattingHead, MobileLoggedInHeader } from '../Components/Header';
import { GrSend } from 'react-icons/gr';
export default function Messages(props) {
	return (
		<Fragment>
			{window.innerWidth <= 76558 ? (
				<Fragment>
					<BottomConsole />
					<MobileLoggedInHeader />
					{/* <FriendListMobile /> */}
					<Messaging />
				</Fragment>
			) : null}
		</Fragment>
	);
}

export function Messaging(props) {
	return (
		<Fragment>
			<ChattingHead />
			<Section id='messaging'>
				<Container>
					<Wrapper>
						<div className='chat-window'>
							<div className='start-convo-illustration'>
								<img
									src={require('../assets/start-convo-illustration.svg').default}
									alt='Start Convo'
								/>
								<h3>Start converstion with Mia.</h3>
								<p>Say hi 👋</p>
							</div>
							{/* <div className='received'>
								<p>HelloHelloHelloHelloHelloHello</p>
							</div>
							<div className='sent'>
								<p>Hello</p>
							</div> */}
						</div>
						<div className='chat-typing-bar'>
							<Container>
								<Wrapper>
									<div className='chat-input'>
										<textarea type='text' placeholder='Aa' />
									</div>
									<div className='send'>
										<GrSend size={30} />
									</div>
								</Wrapper>
							</Container>
						</div>
					</Wrapper>
				</Container>
			</Section>
		</Fragment>
	);
}

export function FriendListMobile(props) {
	return (
		<Section id='friend-list-mb'>
			<Container>
				<Wrapper>
					<div className='actions'>
						<SearchBar placeholder='Search friends' />
						<div className='create-message'>+</div>
					</div>
					<div className='chat-preview-list'>
						<div className='chat-preview'>
							<div className='profile-pic'>
								<img
									src='https://pbs.twimg.com/profile_images/676973135695101952/bwK_jiRb_400x400.jpg'
									alt='Name'
								/>
							</div>
							<div className='preview-chat-details'>
								<div className='name-and-chat'>
									<h4 className='name'>Mia Suarez</h4>
									<p className='chat unread'>
										Hello, Coleen, Samba tayo? Kita tayo sa lokal mamayang 4:10 PM ha.
									</p>
								</div>
								<div className='time-content'>
									<p className='time'>10:46 PM</p>
								</div>
							</div>
						</div>
						<div className='chat-preview'>
							<div className='profile-pic'>
								<img
									src='https://pbs.twimg.com/profile_images/676973135695101952/bwK_jiRb_400x400.jpg'
									alt='Name'
								/>
							</div>
							<div className='preview-chat-details'>
								<div className='name-and-chat'>
									<h4 className='name'>Mia Suarez</h4>
									<p className='chat unread'>
										Hello, Coleen, Samba tayo? Kita tayo sa lokal mamayang 4:10 PM ha.
									</p>
								</div>
								<div className='time-content'>
									<p className='time'>10:46 PM</p>
								</div>
							</div>
						</div>
						<div className='chat-preview'>
							<div className='profile-pic'>
								<img
									src='https://pbs.twimg.com/profile_images/676973135695101952/bwK_jiRb_400x400.jpg'
									alt='Name'
								/>
							</div>
							<div className='preview-chat-details'>
								<div className='name-and-chat'>
									<h4 className='name'>Mia Suarez</h4>
									<p className='chat unread'>
										Hello, Coleen, Samba tayo? Kita tayo sa lokal mamayang 4:10 PM ha.
									</p>
								</div>
								<div className='time-content'>
									<p className='time'>10:46 PM</p>
								</div>
							</div>
						</div>
						<div className='chat-preview'>
							<div className='profile-pic'>
								<img
									src='https://pbs.twimg.com/profile_images/676973135695101952/bwK_jiRb_400x400.jpg'
									alt='Name'
								/>
							</div>
							<div className='preview-chat-details'>
								<div className='name-and-chat'>
									<h4 className='name'>Mia Suarez</h4>
									<p className='chat unread'>
										Hello, Coleen, Samba tayo? Kita tayo sa lokal mamayang 4:10 PM ha.
									</p>
								</div>
								<div className='time-content'>
									<p className='time'>10:46 PM</p>
								</div>
							</div>
						</div>
						<div className='chat-preview'>
							<div className='profile-pic'>
								<img
									src='https://pbs.twimg.com/profile_images/676973135695101952/bwK_jiRb_400x400.jpg'
									alt='Name'
								/>
							</div>
							<div className='preview-chat-details'>
								<div className='name-and-chat'>
									<h4 className='name'>Mia Suarez</h4>
									<p className='chat unread'>
										Hello, Coleen, Samba tayo? Kita tayo sa lokal mamayang 4:10 PM ha.
									</p>
								</div>
								<div className='time-content'>
									<p className='time'>10:46 PM</p>
								</div>
							</div>
						</div>
						<div className='chat-preview'>
							<div className='profile-pic'>
								<img
									src='https://pbs.twimg.com/profile_images/676973135695101952/bwK_jiRb_400x400.jpg'
									alt='Name'
								/>
							</div>
							<div className='preview-chat-details'>
								<div className='name-and-chat'>
									<h4 className='name'>Mia Suarez</h4>
									<p className='chat unread'>
										Hello, Coleen, Samba tayo? Kita tayo sa lokal mamayang 4:10 PM ha.
									</p>
								</div>
								<div className='time-content'>
									<p className='time'>10:46 PM</p>
								</div>
							</div>
						</div>
						<div className='chat-preview'>
							<div className='profile-pic'>
								<img
									src='https://pbs.twimg.com/profile_images/676973135695101952/bwK_jiRb_400x400.jpg'
									alt='Name'
								/>
							</div>
							<div className='preview-chat-details'>
								<div className='name-and-chat'>
									<h4 className='name'>Mia Suarez</h4>
									<p className='chat unread'>
										Hello, Coleen, Samba tayo? Kita tayo sa lokal mamayang 4:10 PM ha.
									</p>
								</div>
								<div className='time-content'>
									<p className='time'>10:46 PM</p>
								</div>
							</div>
						</div>
						<div className='chat-preview'>
							<div className='profile-pic'>
								<img
									src='https://pbs.twimg.com/profile_images/676973135695101952/bwK_jiRb_400x400.jpg'
									alt='Name'
								/>
							</div>
							<div className='preview-chat-details'>
								<div className='name-and-chat'>
									<h4 className='name'>Mia Suarez</h4>
									<p className='chat unread'>
										Hello, Coleen, Samba tayo? Kita tayo sa lokal mamayang 4:10 PM ha.
									</p>
								</div>
								<div className='time-content'>
									<p className='time'>10:46 PM</p>
								</div>
							</div>
						</div>
					</div>
				</Wrapper>
			</Container>
		</Section>
	);
}
