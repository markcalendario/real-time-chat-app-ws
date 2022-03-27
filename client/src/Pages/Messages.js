import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { Container, Section, Wrapper } from '../Components/Base';
import BottomConsole from '../Components/BottomConsole';
import { SearchBar } from '../Components/Forms';
import { ChattingHead, MobileLoggedInHeader } from '../Components/Header';
import { RiSendPlane2Fill } from 'react-icons/ri';
import { BsFillPersonPlusFill } from 'react-icons/bs';
import Cookies from 'universal-cookie';
import moment from 'moment';
import { FaTimes } from 'react-icons/fa';
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
		</Fragment>
	);
}

export function Messaging(props) {
	const [chats, setChats] = useState(null);
	const [talkingTo, setTalkingTo] = useState(null);
	const [typing, setTyping] = useState(false);
	const [socketTyping, setSocketTyping] = useState(null);
	const [socketMessaging, setSocketMessaging] = useState(null);
	const [socketLiveIncomingMessages, setSocketLiveMessages] = useState(null);

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
		setSocketTyping(new WebSocket('ws://localhost:7779/typing'));
		setSocketMessaging(new WebSocket('ws://localhost:7778/messaging'));
		setSocketLiveMessages(new WebSocket('ws://localhost:7780/live-incoming-message-list'));

		fetchChats();
	}, [fetchChats]);

	useEffect(() => {
		if (!socketTyping && !socketMessaging) {
			return;
		}

		socketTyping.addEventListener('message', (data) => {
			const parsed = JSON.parse(data.data);

			if (parsed.chatID === props.chatID && parsed.typerId !== props.userId) {
				setTyping(parsed.typingState);
			}
		});

		socketMessaging.addEventListener('message', (data) => {
			const parsed = JSON.parse(data.data);

			if (parsed.chatID === props.chatID) {
				fetchChats();
			}
		});

		return () => {
			socketTyping.removeEventListener('message', () => {});
			socketMessaging.removeEventListener('message', () => {});
			socketMessaging.close();
			socketTyping.close();
			socketLiveIncomingMessages.close();
		};
	}, [
		fetchChats,
		props.userId,
		props.chatID,
		socketLiveIncomingMessages,
		socketTyping,
		socketMessaging,
	]);

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

	async function handleSendChat() {
		const cookies = new Cookies();

		socketMessaging.send(
			JSON.stringify({
				chatContent: document.getElementById('chat-box').value,
				chatID: props.chatID,
				authorization: 'Bearer ' + cookies.get('access_token'),
			})
		);

		socketLiveIncomingMessages.send(JSON.stringify({ chatID: props.chatID }));
	}

	function handleChatBoxDown() {
		socketTyping.send(
			JSON.stringify({
				typingState: true,
				typerId: props.userId,
				chatID: props.chatID,
			})
		);
	}

	function handleChatBoxUp() {
		socketTyping.send(
			JSON.stringify({
				typingState: false,
				typerId: props.userId,
				chatID: props.chatID,
			})
		);
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
			<BottomConsole />
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

export function FindFriends(props) {
	const [people, setPeople] = useState(null);

	async function findFriend(e) {
		if (e.target.value === '') {
			setPeople(null);
			return;
		}

		const cookies = new Cookies();
		const config = {
			method: 'GET',
			headers: {
				Authorization: 'Bearer ' + cookies.get('access_token'),
			},
		};

		fetch(process.env.REACT_APP_API_URI + '/friends/find/' + e.target.value, config)
			.then((response) => {
				return response.json();
			})
			.then((response) => {
				setPeople(response.people);
			});
	}

	function makeFriends(id) {
		const cookies = new Cookies();
		const config = {
			method: 'POST',
			headers: {
				Authorization: 'Bearer ' + cookies.get('access_token'),
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				with: id,
			}),
		};

		fetch(process.env.REACT_APP_API_URI + '/friends/make-friends/', config)
			.then((response) => {
				return response.json();
			})
			.then((response) => {
				props.changeSelectedFriend(response.chatRoomId);
			});
	}

	return (
		<Section id='ff-modal'>
			<Container>
				<Wrapper>
					<div className='ff-box'>
						<h3 onClick={props.close} className='close'>
							<FaTimes />
						</h3>
						<SearchBar onChange={findFriend} placeholder='Search here' />

						<h3>Select people to chat.</h3>
						<div className='people-list'>
							{people !== null
								? people.map((value) => (
										<div
											key={value._id}
											onClick={() => {
												makeFriends(value._id);
											}}
											className='people'
										>
											<img src={require('../assets/egg2.jpg')} alt='Egg' />
											<p>{value.name}</p>
										</div>
								  ))
								: '...'}
						</div>
					</div>
				</Wrapper>
			</Container>
		</Section>
	);
}

export function FriendListMobile(props) {
	const [friendChats, setFriendChats] = useState(null);
	const [search, setSearch] = useState('');
	const [isAddFriendModalOpen, setAddFriendModalOpenState] = useState(false);
	const [liveChatNotifier, setLiveChatNotifier] = useState(null);

	const fetchFriendChats = useCallback(() => {
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
	}, []);

	useEffect(() => {
		fetchFriendChats();
		setLiveChatNotifier(new WebSocket('ws://localhost:7780/live-incoming-message-list'));
	}, [fetchFriendChats]);

	useEffect(() => {
		let isMounted = true;

		if (!liveChatNotifier) {
			return;
		}

		liveChatNotifier.addEventListener('message', () => {
			if (isMounted) {
				fetchFriendChats();
			}
		});

		return () => {
			isMounted = false;
		};
	}, [fetchFriendChats, liveChatNotifier]);

	async function changeReadValue(chatContentID) {
		const cookies = new Cookies();
		const config = {
			method: 'POST',
			headers: {
				Authorization: 'Bearer ' + cookies.get('access_token'),
			},
		};

		fetch(process.env.REACT_APP_API_URI + '/friends/set-chat-read/' + chatContentID, config);
	}

	function displayFriendChats() {
		if (!props.userId) {
			return;
		}

		return friendChats.map((value) => (
			<Fragment key={value._id}>
				{value.userA_info.firstName.toLowerCase().includes(search.toLowerCase()) ||
				value.userB_info.firstName.toLowerCase().includes(search.toLowerCase()) ? (
					<div
						onClick={async () => {
							if (props.userId === value.chats.receiverId) {
								changeReadValue(value.chats.chatContentId);
							}
							props.changeSelectedFriend(value._id);
						}}
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
								<p className={'chat'}>{value.chats.chatContent}</p>
							</div>
							<div className='time-content-read-info'>
								{props.userId === value.chats.receiverId && !value.chats.receiverRead ? (
									<p className='read'>●</p>
								) : null}
								<p className='time'>
									{moment.unix(value.chats.chatDate).format('hh:mm A')}
								</p>
							</div>
						</div>
					</div>
				) : null}
			</Fragment>
		));
	}

	function searchFriend(e) {
		setSearch(e.target.value);
	}

	return (
		<Section id='friend-list-mb'>
			<Container>
				<Wrapper>
					{isAddFriendModalOpen ? (
						<FindFriends
							close={() => {
								setAddFriendModalOpenState(!isAddFriendModalOpen);
							}}
							changeSelectedFriend={props.changeSelectedFriend}
						/>
					) : null}
					<div className='actions'>
						<SearchBar onChange={searchFriend} placeholder='Search friends' />
						<div
							onClick={() => {
								setAddFriendModalOpenState(!isAddFriendModalOpen);
							}}
							className='create-message'
						>
							<BsFillPersonPlusFill />
						</div>
					</div>
					<div className='chat-preview-list'>
						{friendChats === null || friendChats.length === 0 ? (
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
			<BottomConsole
				handleFindFriendsModalClick={() => setAddFriendModalOpenState(!isAddFriendModalOpen)}
			/>
		</Section>
	);
}
