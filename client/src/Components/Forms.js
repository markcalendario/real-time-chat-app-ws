import React from 'react';
import { RiCheckboxCircleFill, RiCloseCircleFill, RiErrorWarningFill } from 'react-icons/ri';

export function FormInput(props) {
	return (
		<div className='input'>
			<input type={props.type} name={props.name} id={props.id} placeholder={props.placeholder} />
			{props.errorResponse ? <p className='err-resp'>{props.errorResponse}</p> : null}
		</div>
	);
}

export function SearchBar(props) {
	return (
		<div className='search-bar'>
			<input type='text' placeholder={props.placeholder} />
		</div>
	);
}

export function FormResponse(props) {
	return (
		<div className={'form-response ' + props.type}>
			<p className='icon'>
				{props.type === 'error' ? (
					<RiCloseCircleFill />
				) : props.type === 'success' ? (
					<RiCheckboxCircleFill />
				) : props.type === 'warning' ? (
					<RiErrorWarningFill />
				) : null}
			</p>
			<p className='text'>{props.text}</p>
		</div>
	);
}
