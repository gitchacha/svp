SERVER_FILE_SERVICE_URL  = './';
function FileComponent(id, settings) {
	var _id = id;
	var _settings = {
		url: SERVER_FILE_SERVICE_URL,
		template: {
			url: '',
			fileName: ''
		},
		atcFlOwnrDiv: '',
		atcFlOwnrDtlDiv: '',
		atcFlGrpId: '',
		readOnly: false,
		simple: false,
		uploadButton: false,
		top: true,
		preventExts: 'HWP|XLS|XLSX|DOC|DOCX|PPT|PPTX|JPG|JPEG|GIF|PNG|CSV|ZIP|PDF',
		title: '첨부파일',
		messages: {
			DROPBOX_EMPTY: '첨부된 파일이 없습니다.',
			DROPBOX_UPLOAD_EMPTY: '파일을 마우스로 끌어 놓으세요.',
			ERROR_DUPLICATION: '동일한 파일이 이미 있습니다.',
			INVALID_FILE_TYPE: '문서(MS오피스/아래아한글) 및 이미지 파일만 업로드 가능합니다.',
			EMPTY_FILE_SIZE: '용량이 없는 파일은 첨부 되지 않습니다.',
			NOTES: [
			 	'첨부파일의 용량은 20MB를 초과할 수 없습니다.',
			 	'파일추가 버튼을 클릭하여 업로드해 주세요. (여러 파일 첨부 가능)'
			],
			FORBIDDEN_DOWNLOAD: 'svms.skcc.com(외부망)에서는 파일을 다운로드 하실 수 없습니다.<br>svms.sk.com(내부망)을 이용하여 주십시오.'
		},
		success: function(e) {console.log(e)},
		deleteSuccess: function(e) {}
	};

	var DOWNLOAD_URL = SERVER_FILE_SERVICE_URL;
	var UPLOAD_URL = SERVER_FILE_SERVICE_URL;
	var SEARCH_URL = SERVER_FILE_SERVICE_URL;
	var FILE_UPLOAD_INPUT_ID_PREFIX = '_____DEFAULT_FILE_UPLOAD_INPUT_ID______';

	var css = {
		classes: {
			dropbox: 'dropbox',
			file_list_box: 'attach-list',
			file_list_pop: 'j_file_list_pop',
			top: 'extra-info',
			button_clip: 'Button btn_icon_w clip_w',
			dropbox_message: 'message'
		}
	};

	var _buttons = [
		{name: '전체 Download', className: 'Button btn__grid all', clickHandler: function(evt) {
			evt.preventDefault();
			if(_files.length === 0) {
				$sv.alert("다운로드 가능한 파일이 없습니다.");
				return false;
			}

			var errMessage = '';

			$.each(_files, function(index, item) {
				if(item.exists) {
					download(_settings['url'] + '/download?atcFlNb=' + item.atcFlNb, item.srcFlNm);
				} else {
					if(errMessage.length > 0) {
						errMessage += ', ';
					}
					errMessage += item.srcFlNm;
				}
			});

			if(errMessage !== '') {
				errMessage += ' 파일을 다운로드 할 수 없습니다.';
				$sv.alert(errMessage);
			}
		}},
		{name: '양식 다운로드', className: 'Button btn__grid', clickHandler: function(evt) {
			evt.preventDefault();
			download(_settings['template']['url'], _settings['template']['fileName']);
		}},
		{name: '파일업로드', className: 'Button btn__grid upload', clickHandler: function(evt) {
			evt.preventDefault();
			upload();
		}},
		{name: '파일등록', className: 'Button btn__unit line', clickHandler: function(evt) {
			evt.preventDefault();
			var fui = createFileAddInput(_id)
			$(fui).on('change', function(evt) {
				evt.preventDefault();
				var files = evt.target.files;
//				console.log('changeFile : ', files);

				var isValid = true;
				$.each(files, function(index, item) {
					if(isEmptyFileSize(files[index])) {
						$sv.alert(_settings.messages.EMPTY_FILE_SIZE);
						$(filebox).children('input#'+FILE_UPLOAD_INPUT_ID_PREFIX + _id).remove();
						isValid = false;
						return false;
					}
					if(isMaxUploadSizeExceeded(files[index])) {
						$sv.alert(_settings.messages.NOTES[0]);
						var filebox = $('#'+ _id);
						$(filebox).children('input#'+FILE_UPLOAD_INPUT_ID_PREFIX + _id).remove();
						isValid = false;
						return false;
					}
					if(!isFileTypeValid(files[index])) {
						$sv.alert(_settings.messages.INVALID_FILE_TYPE);
						var filebox = $('#'+ _id);
						$(filebox).children('input#'+FILE_UPLOAD_INPUT_ID_PREFIX + _id).remove();
						isValid = false;
						return false;
					}
				});

				if(isValid) {
					$.each(files, function(index, item) {
						addFile(files[index]);
					});
				}

				setTimeout(function() {
					var filebox = $('#'+ _id);
					$(filebox).children('input#'+FILE_UPLOAD_INPUT_ID_PREFIX + _id).remove();
				}, 500);
				updateFileComponentView();
				updateTotalFileSizeView();
			});
			$('#'+ _id).append(fui);
			$(fui).trigger('click');
		}}
	];

	var _file = {
			atcFlNb: '',
			atcFlOwnrDiv: '',
			atcFlOwnrDtlDiv: '',
			atcFlGrpId: '',
			srcFlNm: '',
			length: 0,
			uploaded: false,
			deletable: false,
			exists: false,
			file: null
	};

	var _files = [];

	initialize(id,settings);

	function initialize(id, settings) {
		_id = id;
		setSettings(settings);
		setRequestUrls(settings);
		var _filebox = $('#'+ _id);
		$(_filebox).addClass('fileupload__primary');
		setDropBox(_filebox);
		search();
		if(_settings['top'] === true) {
			setTop(_filebox);
		}
	}

	function createFileAddInput(id) {
		var input = document.createElement('input');
		input.type = 'file';
		input.style.cssText = 'display: none';
		input.setAttribute('multiple', 'multiple');
		input.id = FILE_UPLOAD_INPUT_ID_PREFIX + id;
		return input;
	}

	function setSettings(settings) {
		copyObjectProperties(settings, _settings);
	}

	function copyObjectProperties(src, target) {
		for(var key in src) {
			if(src[key] instanceof Object) {
				if(target[key] === undefined) target[key] = {};
				if(typeof(src[key]) === 'function') {
					target[key] = src[key];
				} else {
					copyObjectProperties(src[key], target[key]);
				}
			} else {
				target[key] = src[key];
			}
		}
	}

	function setRequestUrls(settings) {
		DOWNLOAD_URL = SERVER_FILE_SERVICE_URL + '/download';
		UPLOAD_URL = SERVER_FILE_SERVICE_URL + '/v1/api/upload';
		SEARCH_URL = SERVER_FILE_SERVICE_URL + '/v1/api/search';
	}

	function setDropBox(filebox) {
		removeDropBox(filebox);
		var _dropbox = document.createElement('div');
		$(_dropbox).addClass(css.classes.dropbox);

		$(_dropbox).on('click', function(e) {});

		if(_files.length == 0) {
			$(_dropbox).append(createDropBoxEmptyMessage());
		}
		$(_dropbox).on('drop', dropHandler);

		$(_dropbox).on('dragover', function(ev) {
			ev.preventDefault();
		});
		$(filebox).append(_dropbox);
	}

	function removeDropBox(filebox) {
		while(filebox.firstChild) {
			$(filebox.firstChild).remove();
		}
	}

	function createDropBoxEmptyMessage(msg) {
		var _messagebox = document.createElement('div');
		$(_messagebox).addClass(css.classes.dropbox_message);
		if(!_settings.readOnly) {
			$(_messagebox).append(document.createElement('span'));
		}
		var _message = document.createElement('p');
		if(msg === undefined || msg === null) {
			if(_settings.readOnly) {
				msg = _settings.messages.DROPBOX_EMPTY;
			} else {
				msg = _settings.messages.DROPBOX_UPLOAD_EMPTY;
			}
		}
		$(_message).append(document.createTextNode(msg));
		$(_messagebox).append(_message);
		return _messagebox;
	}

	function setTop(filebox) {
		var topSize = $(filebox).children('.extra-info').length;

		if(topSize > 0) {
			return;
		}

		var top = document.createElement('div');
		top.className = css.classes.top;
		var actions = document.createElement('span');
		actions.className = 'actions';

		var templateDownloadUrl = _settings['template']['url'];
		if(templateDownloadUrl !== undefined && templateDownloadUrl !== '') {
			setButton(actions, _buttons[1]);
		}
		if(_settings['readOnly'] === true) {
			setButton(actions, _buttons[0]);
		} else {
			setButton(actions, _buttons[3]);
			if(_settings['uploadButton']) {
				setButton(actions, _buttons[2]);
			}
		}

		setFileSizeIndicator(top);
		$(top).append(actions);
		$(filebox).prepend(top);
	}

	function setFileSizeIndicator(el) {
		var _indicator = document.createElement('div');
		$(_indicator).addClass('volume-total');
		_indicator.innerHTML = '<strong class="volume-heading">'+ _settings['title'] +'</strong><i>' + getTotalFileSize('MB') + 'MB</i><b></b>';
		$(el).append(_indicator);
	}

	function setButton(elObj, btn) {
		var _btn = document.createElement('a');
		_btn.href = '#';
		$(_btn).attr('type', 'button');
		$(_btn).addClass(btn.className);
		$(_btn).append(document.createTextNode(btn.name));
		$(_btn).on('click', btn.clickHandler);
		$(elObj).append(_btn);
	}

	function updateFileComponentView() {
		var filebox = $('#'+ _id);
		var dropbox = $(filebox).children('.'+css.classes.dropbox)[0];
		var fileListCss = css.classes.file_list_box;

		if(_settings.simple) {
			fileListCss = css.classes.file_list_pop;
		}

		if(_files.length > 0) {
			if(dropbox !== undefined && dropbox !== null) {
				dropbox.innerHTML = '';
				dropbox.className = fileListCss;
			}

			var fileListBox = $(filebox).children('.'+fileListCss)[0];

			if(fileListBox !== undefined && fileListBox !== null) {
				fileListBox.innerHTML = '';
				var ul = document.createElement('ul');
				$.each(_files, function(index, item) {
					var li = createFileInfoNode(item);
					$(ul).append(li);
				})
				$(fileListBox).append(ul);
			}
		} else {
			dropbox = $(filebox).children('.'+fileListCss)[0];
			if(dropbox === undefined || dropbox === null) {
				dropbox = $(filebox).children('.'+css.classes.dropbox)[0]
			}
			dropbox.innerHTML = '';
			dropbox.className = 'dropbox';
			$(dropbox).append(createDropBoxEmptyMessage());
		}
		var bottomElement = $('#'+ _id + ' .extra-info');
		if(bottomElement.length > 0) {
			$(bottomElement).remove();
		}
		setTop(filebox);
	}

	function updateTotalFileSizeView() {
		var bot = $('#'+ _id + ' .extra-info');
		if(bot.length > 0) {
			var vnum = $(bot).children('.volume-total').children('i')[0]
			vnum.innerHTML = getTotalFileSize('MB');
			vnum.innerHTML += 'MB';
		}
	}

	function createFileInfoNode(fileInfo) {
		var li = document.createElement('li');
		$(li).append(createActionIconNode(fileInfo));
		$(li).append(createFileNameNode(fileInfo));
		$(li).append(createFileSizeNode(fileInfo));
		return li;
	}

	function createActionIconNode(fileInfo) {
		var icon = document.createElement('div');
		var btn = document.createElement('button');
		$(btn).attr('type', 'button');

		if(_settings.readOnly && fileInfo.uploaded && !fileInfo.deletable && fileInfo.atcFlNb !== undefined && fileInfo.atcFlNb !== null && fileInfo.atcFlNb !== '') {
			$(btn).on('click', function(evt) {
				evt.preventDefault();
				if(fileInfo.exists === false) {
					$sv.alert('[' + fileInfo.srcFlNm + '] 파일을 찾을 수 없습니다.');
				} else {
					var url = _settings['url'] + "/download?atcFlNb=" + fileInfo.atcFlNb;
					download(url, fileInfo.srcFlNm);
				}
			});
		} else {
			$(btn).addClass('Button btn__delete').attr('title','파일삭제');
			$(btn).on('click', function(evt) {
				$sv.confirmFile('파일을 삭제하시겠습니까?', _id, fileInfo, 'removeConfirm');
			});
			$(btn).append(document.createTextNode('파일삭제'));
		}
		$(icon).addClass('action').append(btn);
		return icon;
	}

	this.removeConfirm = function(flag, fileInfo) {
		if(flag == 'ok') {
			if(fileInfo.uploaded) {
				deleteRemoteFile(fileInfo.atcFlNb);
			}
			removeFile(fileInfo);
			updateFileComponentView();
		}
	}

	function createFileNameNode(fileInfo) {
		var div = document.createElement('div');
		if(fileInfo.uploaded) {
			$(div).addClass('success');
		}

		var span = document.createElement('span');
		var type = getIconClassName(fileInfo.srcFlNm);

		$(span).addClass('name').append('<i class="icon i-file-'+ type +'"></i>' + fileInfo.srcFlNm);
		$(div).addClass('filename').append(span);

		if(fileInfo.uploaded) {
			div.style = 'cursor: pointer;';
			$(div).on('click', function(evt) {
				if(fileInfo.exists === false) {
					$sv.alert('[' + fileInfo.srcFlNm + '] 파일을 찾을 수 없습니다.');
				} else {
					var url = _settings['url'] + "/download?atcFlNb=" + fileInfo.atcFlNb;
					download(url, fileInfo.srcFlNm);
				}
			});
		}
		return div;
	}

	function createFileSizeNode(fileInfo) {
		var div = document.createElement('div');
		if(fileInfo.uploaded) {
			$(div).addClass('success');
		}

		$(div).addClass('info').html('<span class="size">'
				+ getFileSizeWithUnit(fileInfo.flVol) + '</span>'
				+ '<span class="date">'+ getFileDate(fileInfo) +'</span>');
		return div;
	}

	function getFileDate(fileInfo) {
		return $sv.isNotEmpty(fileInfo.rgstDtm) ?
			new Date(fileInfo.rgstDtm).format('yyyy.MM.dd') :
			new Date().format('yyyy.MM.dd');
	}

	function extractExt(fileName) {
		var re = /(?:\.([^.]+))?$/;
		return re.exec(fileName)[1];
	}

	function getIconClassName(fileName) {
			// 이미지 외 알려진 확장자
			var ext = extractExt(fileName);
//			console.log("fileName: " + fileName);
//			console.log("ext: " + ext);
			ext = ext.toLowerCase();
			if(ext === 'xlsx' || ext === 'xls') {
				return 'xls';
			} else if(ext === 'docx' || ext === 'doc') {
				return 'word';
			} else if(ext === 'ppt'|| ext === 'pptx') {
				return 'ppt';
			} else if(ext === 'pdf') {
				return 'pdf';
			} else if(ext === 'txt') {
				return 'txt';
			} else if(ext === 'zip') {
				return 'zip';
			} else if(ext === 'png' || ext === 'jpg' || ext === 'bmp') {
				return 'img';
			}
		// }
		// 기타
		return 'etc';
	}

	function getTotalFileSize(unit) {
		var total = 0;

		$.each(_files, function(index, item) {
			total += Number(item.flVol);
		});

		if(unit === 'MB') {
			return (total/1024/1024).toFixed(2);
		}
		return total;
	}

	function getFileSizeWithUnit(fileSize) {
		var output = fileSize + ' Bytes';
		for(var multiples = ["KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"], multiple = 0, approx = fileSize / 1024; approx > 1; approx /= 1024, multiple++) {
			output = approx.toFixed(2) + " " + multiples[multiple];
		}
		return output;
	}

	function isEmptyFileSize(newFile) {
		if(newFile.size == 0) {
			return true;
		}
		return false;
	}
	function isMaxUploadSizeExceeded(newFile) {
		var MAX_UPLOAD_SIZE = 20 * 1024 * 1024;
//		var totalFileSize = getTotalFileSize();
		var totalFileSize = 0;
		if(newFile) {
			totalFileSize += newFile.size;
		}
		if(MAX_UPLOAD_SIZE >= totalFileSize) {
			return false;
		}
		return true;
	}

	function contains(file) {
		var fileName = file.name.toLowerCase();
		var isContails = false;

		$.each(_files, function(index, item) {
			if(fileName === item.srcFlNm && file.size === item.flVol) {
				isContails = true;
				return false;
			}
		});

		return isContails;
	}

	function addFile(file) {
		if(!contains(file)) {
			var fileInfo = {};
			fileInfo.srcFlNm = file.name.toLowerCase();
			fileInfo.flVol = file.size;
			fileInfo.file = file;
			fileInfo.uploaded = false;
			_files.push(fileInfo);
		} else {
			$sv.alert(_settings.messages.ERROR_DUPLICATION);
		}
	}

	function removeFile(fileInfo) {
		$.each(_files, function(index, item) {
			if($sv.isNotEmpty(fileInfo.atcFlNb)) {
				if(fileInfo.atcFlNb == item.atcFlNb) {
					_files.splice(index, 1);
					return false;
				}
			} else {
				//팝업에서 호출시 객체 비교가 안됨.
				if(JSON.stringify(item) == JSON.stringify(fileInfo)) {
					_files.splice(index, 1);
	//				removeFile(fileInfo);
					return false;
				}
			}
		});
		updateTotalFileSizeView();
	}

	// event
	function dropHandler(ev) {
		ev.preventDefault();

		if(!_settings.readOnly) {
			var tmpFiles = [];
			ev.dataTransfer = ev.originalEvent.dataTransfer;
			if(ev.dataTransfer.items) {

				$.each(ev.dataTransfer.items, function(index, item) {
					if(item.kind === 'file') {
						var file = item.getAsFile();
						tmpFiles.push(file);
					}
				});
			} else {
				$.each(ev.dataTransfer.files, function(index, item) {
					tmpFiles.push(item);
				});
			}

			var isValid = true;
			$.each(tmpFiles, function(index, item) {
				if(isEmptyFileSize(item)) {
					$sv.alert(_settings.messages.EMPTY_FILE_SIZE);
					isValid = false;
					return false;
				}
				if(isMaxUploadSizeExceeded(item)) {
					$sv.alert(_settings.messages.NOTES[0]);
					isValid = false;
					return false;
				}
				if(!isFileTypeValid(item)) {
					$sv.alert(_settings.messages.INVALID_FILE_TYPE);
					isValid = false;
					return false;
				}
			});

			if(isValid) {
				$.each(tmpFiles, function(index, item) {
					addFile(item);
				});
			}

			updateFileComponentView();
			updateTotalFileSizeView();
			removeDragData(ev);
		} else {
			$sv.alert("다운로드만 가능합니다.");
		}
	}

	function dragOverHandler(ev) {
		ev.preventDefault();
	}

	function removeDragData(ev) {
		if(ev.dataTransfer.items) {
			ev.dataTransfer.items.clear();
		} else {
			ev.dataTransfer.clearData();
		}
	}

	function upload() {
		var uploadFiles = [];

		$.each(_files, function(index, fileInfo) {
			if(fileInfo.uploaded === false && fileInfo.file !== undefined && fileInfo.file !== null) {
				uploadFiles.push(fileInfo.file);
			}
		});

//		if(uploadFiles.length == 0) {
//			$sv.alert("첨부한 파일이 없습니다.");
//			return;
//		}
		if(isMaxUploadSizeExceeded()) {
			$sv.alert(_settings.messages.NOTES[0]);
			return;
		}

		if(uploadFiles.length > 0) {
			var formData = Array.prototype.reduce.call(
					uploadFiles,
					function(formData, file, i) {
						formData.append('file_' + i, file);
						return formData;
					},
					new FormData()
				);

			var atcFlGrpId = _settings['atcFlGrpId'];
			if(atcFlGrpId === 'null') {
				atcFlGrpId = '';
			}
			formData.append('atcFlOwnrDiv', _settings['atcFlOwnrDiv']);
			formData.append('atcFlOwnrDtlDiv', _settings['atcFlOwnrDtlDiv']);
			formData.append('atcFlGrpId', atcFlGrpId);
			View.showProgress();
			$.ajax({
				url: _settings['url'] + '/v1/api/upload',
				data: formData,
				processData: false,
				contentType: false,
				type: 'POST',
				xhrFields: {
					withCredentials: true
				},
				crossDomain: true,
				success: successHandler
			})
			.fail(function(jqXHR, textStatus) {
				$sv.alert(JSON.stringify(jqXHR));
			})
			.always(function() {
				View.hideProgress();
			});
		} else {
			dummySuccessHandler.apply();
		}
	}

	this.upload = function() {
		upload();
	};

	function dummySuccessHandler() {
		var _user_defined_cb = _settings['success'];

		if($sv.isNotEmpty(_user_defined_cb)) {
			_user_defined_cb.call();
		}
	}

	function successHandler(res) {
//		console.log('successHandler:', res);
		if(res.status != 200) {
			$sv.alert(res.message);
			return;
		}

		var result = res.data;
		var _user_defined_cb = _settings['success'];

		//업로드대상 파일정보 제거후 업로드한 데이터 추가
		_files = $.grep(_files, function(fItem, fIdx) {
			return fItem.uploaded === true;
		});
		$.each(result, function(rIdx, rItem) {
			rItem.uploaded = true;
			rItem.deletable = true;
			_files.push(rItem);
		});

		if($sv.isEmpty(_settings['atcFlGrpId']) && result.length > 0) {
			_settings['atcFlGrpId'] = result[0].atcFlGrpId;
		}
		updateFileComponentView();
		updateTotalFileSizeView();

		if($sv.isNotEmpty(_user_defined_cb)) {
			_user_defined_cb.call(this, result);
		}
	}

	this.downloadFile = function(fileInfo) {
		var url = _settings['url'] + "/download?atcFlNb=" + fileInfo.atcFlNb;
		download(url, fileInfo.srcFlNm);
	}

	function download(url, fileName) {
//		if(window.location.host == 'svms.skcc.com') {
//			$sv.alert(_settings.messages.FORBIDDEN_DOWNLOAD);
//			return;
//		}

		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.responseType = 'blob';
		xhr.withCredentials = true;
		xhr.onprogress = function(evt) {
			if(evt.lengthComputable) {
				var percentComplete = (evt.loaded / evt.total)*100;
			}
		};
		xhr.onload = function(evt) {
			if(this.status == 200) {
				var blob = this.response;
				if(requiredFeaturesSupported()) {
					window.navigator.msSaveOrOpenBlob(blob, fileName);
				} else {
					var a = document.createElement('a');
					$(document.body).append(a);
					a.style.cssText = 'display: none;';
					a.href = url;
					a.download = fileName;
					a.target = '_blank';
					a.click();
					$(a).remove();
				}
			} else {
				console.log('error!!!');
			}
		};
		xhr.onerror = function(evt) {};
		xhr.send();
	}

	function requiredFeaturesSupported() {
		return (BlobConstructor() && msSaveOrOpenBlobSupported());
	}

	function BlobConstructor() {
		if(!window.Blob) {
			return false;
		}
		return true;
	}

	function msSaveOrOpenBlobSupported() {
		if(!window.navigator.msSaveOrOpenBlob) {
			return false;
		}
		return true;
	}

	this.changeReadOnly = function(bool) {
		_settings['readOnly'] = bool;
		$.each(_files, function(index, item) {
			item.deletable = false;
		});
		updateFileComponentView();
		updateTotalFileSizeView();
	}

	function search() {
		if(SEARCH_URL !== undefined && SEARCH_URL !== null && SEARCH_URL !== '') {
			if($sv.isEmpty(_settings['atcFlOwnrDiv']) || $sv.isEmpty(_settings['atcFlGrpId'])) {
				return;
			}
			var params = {atcFlOwnrDiv: _settings['atcFlOwnrDiv'], atcFlGrpId: _settings['atcFlGrpId']};
			_files = [];
			$a.request(SEARCH_URL, {
				method: 'get',
				async: false,
				data: params,
				withCredentials: true,
				success : function(res) {
					$.each(res.data, function(index, item) {
						item.uploaded = true;
						item.deletable = !_settings['readOnly'];
						_files.push(item);
					});
					updateFileComponentView();
					updateTotalFileSizeView();
				}
			});
		}
	}

	function deleteRemoteFile(atcFlNb) {
		var url = _settings['url'] + '/v1/api/delete';
		$a.request(url, {
			method: 'delete',
			async: true,
			data: {atcFlNb: atcFlNb},
			withCredentials: true,
			success : _settings['deleteSuccess']
		});
	}

	this.setTitle = function(title) {
		_settings['title'] = title;
		$('#'+_id+' .volume-heading').text(title);
	}

	this.getFileList = function() {
		return _files;
	}

	this.isExist = function() {
		if(_files.length === 0) return false;
		return true;
	}

	this.getGrpId = function() {
		return _settings['atcFlGrpId'];
	}

	this.changeGrpId = function(atcFlGrpId) {
		_settings['atcFlGrpId'] = atcFlGrpId;
		search();
	};

	this.changeSettings = function(settings) {
		setSettings(settings);
		updateFileComponentView();
		updateTotalFileSizeView();
		search();
	}

	function isFileTypeValid(newFile) {
		var regExp = new RegExp("\.(" + _settings.preventExts.toLowerCase() + ")$");
		if(regExp.test(newFile.name.toLowerCase())) {
			return true;
		}
		return false;
	}

	function requestPreventiveFileExts() {
		var url = _settings['url'] + '/v1/api/preventiveFileExtensions';
		$a.request(url, {
			method: 'get',
			async: false,
			data: {atcFlNb: atcFlNb},
			withCredentials: true,
			success : function(result) {
				_settings.preventExts = result;
			}
		});
	}

};
