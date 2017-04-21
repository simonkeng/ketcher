import { h, Component } from 'preact';
/** @jsx h */

const ieCb = window.clipboardData;

class ClipArea extends Component {
	shouldComponentUpdate() {
		return false;
	}
	componentDidMount() {
		let el = this.refs ? this.refs.base : this.base;
		let target = this.props.target || el.parentNode;
		let self = this;

		// TODO: remove event listeners on unmount or
		//       target change
		target.addEventListener('mouseup', event => {
			if (!self.props.disabled)
				autofocus(el);
		});

		['copy', 'cut'].forEach(en => {
			let cb = (en == 'copy') ? 'onCopy' : 'onPaste';
			target.addEventListener(en, event => {
				if (!self.props.disabled && self.props[cb]) {
					var data = self.props[cb]();
					if (data)
						copy(event.clipboardData, data);
					event.preventDefault();
				}
			});
		});

		target.addEventListener('paste', event => {
			if (!self.props.disabled && self.props.onPaste) {
				var data = paste(event.clipboardData,
								 self.props.formats);
				if (data)
					self.props.onPaste(data);
				event.preventDefault();
			}
		});
	}
	render () {
		return (
			<i className="cliparea" contentEditable="true"
			   autoFocus="true" {...this.props}/>
		);
	}
}

function autofocus(cliparea) {
	cliparea.value = ' ';
	cliparea.focus();
	cliparea.select();
};

function copy(cb, data) {
	if (!cb && ieCb) {
		ieCb.setData('text', data['text/plain']);
	} else {
		cb.setData('text/plain', data['text/plain']);
		try {
			Object.keys(data).forEach(function (fmt) {
				cb.setData(fmt, data[fmt]);
			});
		} catch (ex) {
			console.info('Could not write exact type', ex);
		}
	}
};

function paste(cb, formats) {
	var data = {};
	if (!cb && ieCb) {
		data['text/plain'] = ieCb.getData('text');
	} else {
		data['text/plain'] = cb.getData('text/plain');
		data = formats.reduce(function (data, fmt) {
			var d = cb.getData(fmt);
			if (d)
				data[fmt] = d;
			return data;
		}, data);
	}
	return data;
};

export const actions = ['cut', 'copy', 'paste'];
export function exec(action) {
	let enabled = document.queryCommandSupported(action);
	if (enabled) try {
		enabled = document.execCommand(action);
	} catch (ex) {
		// FF < 41
		enabled = false;
	}
	return enabled;
}

export default ClipArea;
