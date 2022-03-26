import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { Container, Section, Wrapper } from '../Components/Base';
import BottomConsole from '../Components/BottomConsole';
import { SearchBar } from '../Components/Forms';
import { ChattingHead, MobileLoggedInHeader } from '../Components/Header';
import { RiSendPlane2Fill } from 'react-icons/ri';
import { BsFillPersonPlusFill } from 'react-icons/bs';
import Cookies from 'universal-cookie';

export default function Messages() {
	const [selectedChat, setSelectedChat] = useState(null);
	const [userId, setUserId] = useState(null);
	const [userName, setUserName] = useState(null);

	useEffect(() => {
		getId();
	}, []);

	const getName = useCallback(async () => {
		const names = await getUserName(userId);
		setUserName(names.fullName);
	}, [setUserName, userId]);

	useEffect(() => {
		getName();
	}, [userId, getName]);

	async function getId() {
		const id = await getUserId();
		setUserId(id);
	}

	return (
		<Fragment>
			<MobileLoggedInHeader />
			{selectedChat === null ? (
				<FriendListMobile
					fullName={userName}
					userId={userId}
					changeSelectedFriend={setSelectedChat}
				/>
			) : (
				<Messaging fullName={userName} userId={userId} chatID={selectedChat} />
			)}
			<BottomConsole />
		</Fragment>
	);
}

export function Messaging(props) {
	const [chats, setChats] = useState(null);
	const [talkingTo, setTalkingTo] = useState(null);
	const [typing, setTyping] = useState(false);

	const fetchChats = useCallback(() => {
		const cookies = new Cookies();
		const config = {
			method: 'GET',
			headers: {
				Authorization: 'Bearer ' + cookies.get('access_token'),
			},
		};
		fetch(process.env.REACT_APP_API_URI + '/friends/get-chats/' + props.chatID, config)
			.then((response) => {
				return response.json();
			})
			.then((response) => {
				setChats(response.chats);
				document.getElementById('chat-box').value = '';
			});
	}, [setChats, props.chatID]);

	useEffect(() => {
		fetchChats();
	}, [fetchChats]);

	useEffect(() => {
		const socket = new WebSocket('ws://localhost:7778/messaging');
		socket.addEventListener('open', () => {
			console.log('WS Connected.');
		});

		socket.addEventListener('message', (data) => {
			const parsed = JSON.parse(data.data);

			if (parsed.chatID === props.chatID) {
				fetchChats();
			}
		});
	}, [fetchChats, props.chatID]);

	useEffect(() => {
		const socket = new WebSocket('ws://localhost:7779/typing');
		socket.addEventListener('message', (data) => {
			const parsed = JSON.parse(data.data);

			if (parsed.chatID === props.chatID && parsed.typerId !== props.userId) {
				setTyping(parsed.typingState);
			}
		});
	}, [props.userId, props.chatID]);

	useEffect(() => {
		if (chats === null) return;

		async function getTalkingToName() {
			let userName;

			if (chats.userB === props.userId) {
				userName = await getUserName(chats.userA);
			} else {
				userName = await getUserName(chats.userB);
			}

			setTalkingTo(userName.firstName);
		}

		getTalkingToName();
	}, [chats, props.userId]);

	function displayChats() {
		return chats.chats.map((val) => (
			<Fragment key={Math.random() * 99999}>
				{props.userId === val.receiverId ? (
					<div className='received'>
						<p>{val.chatContent}</p>
					</div>
				) : (
					<div className='sent'>
						<p>{val.chatContent}</p>
					</div>
				)}
			</Fragment>
		));
	}

	async function handleSendChat(e) {
		const cookies = new Cookies();

		const socket = new WebSocket('ws://localhost:7778/messaging');
		socket.addEventListener('open', () => {
			socket.send(
				JSON.stringify({
					chatContent: document.getElementById('chat-box').value,
					chatID: props.chatID,
					authorization: 'Bearer ' + cookies.get('access_token'),
				})
			);
		});
	}

	function handleChatBoxDown() {
		const socket = new WebSocket('ws://localhost:7779/typing');
		socket.addEventListener('open', () => {
			socket.send(
				JSON.stringify({
					typingState: true,
					typerId: props.userId,
					chatID: props.chatID,
				})
			);
		});
	}

	function handleChatBoxUp() {
		const socket = new WebSocket('ws://localhost:7779/typing');
		socket.addEventListener('open', () => {
			socket.send(
				JSON.stringify({
					typingState: false,
					typerId: props.userId,
					chatID: props.chatID,
				})
			);
		});
	}

	return (
		<Fragment>
			<ChattingHead fullName={talkingTo} />
			<Section id='messaging'>
				<Container>
					<Wrapper>
						{typing ? (
							<p style={{ padding: '10px', border: '1px purple solid', color: 'purple' }}>
								Typing...
							</p>
						) : null}
						<div className='chat-window'>
							{chats === null ? (
								'...'
							) : chats.length === 0 ? (
								<div className='start-convo-illustration'>
									<img
										src={require('../assets/start-convo-illustration.svg').default}
										alt='Start Convo'
									/>
									<h3>Start converstion with {talkingTo}</h3>
									<p>Say hi 👋</p>
								</div>
							) : (
								displayChats()
							)}
						</div>
						<div className='chat-typing-bar'>
							<Container>
								<Wrapper>
									<div className='chat-input'>
										<textarea
											onKeyDown={handleChatBoxDown}
											onKeyUp={handleChatBoxUp}
											id='chat-box'
											type='text'
											placeholder='Aa'
										/>
									</div>
									<h3 onClick={handleSendChat} className='send'>
										<RiSendPlane2Fill size={20} />
									</h3>
								</Wrapper>
							</Container>
						</div>
					</Wrapper>
				</Container>
			</Section>
		</Fragment>
	);
}

async function getUserId() {
	const cookies = new Cookies();
	const config = {
		method: 'GET',
		headers: {
			Authorization: 'Bearer ' + cookies.get('access_token'),
		},
	};

	return new Promise((resolve) => {
		fetch(process.env.REACT_APP_API_URI + '/users/my-user-id', config)
			.then((response) => {
				return response.json();
			})
			.then((response) => {
				resolve(response.id);
			});
	});
}

async function getUserName(id) {
	const cookies = new Cookies();
	const config = {
		method: 'GET',
		headers: {
			Authorization: 'Bearer ' + cookies.get('access_token'),
		},
	};

	return new Promise((resolve) => {
		fetch(process.env.REACT_APP_API_URI + '/users/get-name/' + id, config)
			.then((response) => {
				return response.json();
			})
			.then((response) => {
				resolve(response);
			});
	});
}

export function FriendListMobile(props) {
	const [friendChats, setFriendChats] = useState(null);

	useEffect(() => {
		fetchFriendChats();
	}, []);

	function fetchFriendChats() {
		const cookies = new Cookies();
		const config = {
			method: 'GET',
			headers: {
				Authorization: 'Bearer ' + cookies.get('access_token'),
			},
		};
		fetch(process.env.REACT_APP_API_URI + '/friends/get-latest-chats', config)
			.then((response) => {
				return response.json();
			})
			.then((response) => {
				setFriendChats(response.result);
			});
	}

	function displayFriendChats() {
		if (!props.userId) {
			return;
		}

		return friendChats.map((value) => (
			<div
				onClick={() => {
					props.changeSelectedFriend(value._id);
				}}
				key={value._id}
				className='chat-preview'
			>
				<div className='profile-pic'>
					<img src={require('../assets/egg2.jpg')} alt='Name' />
				</div>
				<div className='preview-chat-details'>
					<div className='name-and-chat'>
						<h4 className='name'>
							{props.userId === value.userA
								? value.userB_info.firstName
								: value.userA_info.firstName}
						</h4>
						<p className='chat unread'>{value.chats.chatContent}</p>
					</div>
					<div className='time-content-read-info'>
						{props.userId === value.chats.receiverId && !value.chats.receiverRead ? (
							<p className='read'>●</p>
						) : null}
						<p className='time'>{value.chats.chatDate}</p>
					</div>
				</div>
			</div>
		));
	}

	return (
		<Section id='friend-list-mb'>
			<Container>
				<Wrapper>
					<div className='actions'>
						<SearchBar placeholder='Search friends' />
						<div className='create-message'>
							<BsFillPersonPlusFill />
						</div>
					</div>
					<div className='chat-preview-list'>
						{friendChats === null ? (
							<div className='no-chat-display'>
								<img src={require('../assets/no-chat.svg').default} alt='No chat' />
								<h2>Hello, {props.fullName}</h2>
								<p>Add friends to chat.</p>
							</div>
						) : (
							displayFriendChats()
						)}
					</div>
				</Wrapper>
			</Container>
		</Section>
	);
}
