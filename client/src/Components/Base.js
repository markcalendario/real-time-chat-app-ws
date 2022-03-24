import React from 'react';

export function Section(props) {
	return <section id={props.id}>{props.children}</section>;
}

export function Container(props) {
	return <section className='container'>{props.children}</section>;
}

export function Wrapper(props) {
	return <section className='wrapper'>{props.children}</section>;
}
