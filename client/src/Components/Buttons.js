import React from 'react';

export default function Button(props) {
	return (
		<button
			id={props.id}
			name={props.name}
			type='button'
			onClick={props.onClick}
			className={
				'btn' +
				(props.className ? ' ' + props.className : '') +
				(props.btnStyle ? ' ' + props.btnStyle : '')
			}
		>
			{props.children}
		</button>
	);
}
