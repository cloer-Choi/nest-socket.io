import {
  createH2,
  createInput,
  createButton,
  createForm,
  createUlWithId,
  createLiWithClass,
} from './functions.js';

class App {
  constructor() {
    this.socket = io(`/chats`);
    this.setSocketEvent();
    this.route('login');
  }

  setSocketEvent() {
    this.socket.onAny((event) => console.log(`[ ${event} ]`));
    this.socket.on('create_room', ({ room }) => this.addRoom(room));
    this.socket.on('delete_room', ({ roomId }) => this.removeRoom(roomId));
    this.socket.on('enter_room', ({ nickname }) =>
      this.addChat({ message: `${nickname} has entered.`, nickname: 'system' }),
    );
    this.socket.on('new_message', ({ chat }) => this.addChat(chat));
  }

  route(pageName, ...args) {
    const root = document.getElementById('root');
    root.innerHTML = '';
    let pageElementsList = [createH2('Error')];
    switch (pageName) {
      case 'login':
        pageElementsList = this.getLogInPage(...args);
        break;
      case 'robby':
        pageElementsList = this.getRobbyPage();
        break;
      case 'chat':
        pageElementsList = this.getChatPage(...args);
        break;
    }
    root.append(...pageElementsList);
  }

  // Pages
  getLogInPage(message = 'Please set your nickname!') {
    if (this.socket.nickname === sessionStorage.getItem('nickname'))
      return this.getRobbyPage();
    sessionStorage.clear();
    const $logInMessage = createH2(message);
    const $input = createInput('Nickname');
    const $button = createButton('Log In');
    const $logInForm = createForm([$input, $button], (e) => {
      e.preventDefault();
      const nickname = $input.value;
      $input.value = '';
      this.socket.emit('login', { nickname }, (res) => {
        if (!res.isSuccess) $logInMessage.innerText = res.reason;
        else {
          sessionStorage.setItem('nickname', nickname);
          this.socket['nickname'] = nickname;
          this.route('robby');
        }
      });
    });
    return [$logInMessage, $logInForm];
  }

  getRobbyPage() {
    const nickname = this.socket.nickname;
    if (!nickname) return this.getLogInPage();

    const $h2 = createH2(`Hello, ${nickname}`);
    const $input = createInput('Title');
    const $button = createButton('Create Room');
    const $roomList = createUlWithId('room-list');

    this.socket.emit('enter_robby', (res) => {
      if (!res.isSuccess) console.log('[ enter_robby ] fail'); //rooms
      else {
        const { rooms } = res.data;
        rooms.forEach((room) => this.addRoom(room));
      }
    });

    const $createRoomForm = createForm([$input, $button], (e) => {
      e.preventDefault();
      const roomName = $input.value;
      $input.value = '';

      this.socket.emit('create_room', { roomName }, (res) => {
        if (!res.isSuccess) {
          this.route('login', res.reason);
        } else {
          const { roomId } = res.data;
          this.addRoom({ roomId, roomName });
        }
      });
    });
    const $LogOutButton = createButton('Log Out');
    $LogOutButton.addEventListener('click', () => {
      sessionStorage.clear();
      this.socket.emit('logout');
      this.route('login');
    });

    return [$h2, $createRoomForm, $roomList, $LogOutButton];
  }

  getChatPage(roomName) {
    const $h2 = createH2(roomName);
    const $chatList = createUlWithId('chat-list');

    const $input = createInput('Message...');
    const $sendButton = createButton('Send');
    const $form = createForm([$input, $sendButton], (e) => {
      e.preventDefault();
      const message = $input.value;
      $input.value = '';
      console.log(message);
    });
    const $leaveButton = createButton('Leave'); // TODO:
    const $robbyButton = createButton('Robby');

    this.socket.emit('enter_room', { roomName }, (res) => {
      if (!res.isSuccess) this.route('login', res.reason);
      else {
        const { chats } = res.data;
        chats.forEach((chat) => this.addChat(chat));
      }
    });

    return [$h2, $chatList, $form, $leaveButton, $robbyButton];
  }

  //
  addRoom({ roomId, roomName }) {
    const $roomList = document.getElementById('room-list');
    const $li = createLiWithClass();
    const $a = document.createElement('a');
    $a.onclick = () => this.route('chat', roomName);

    $a.innerText = roomName;
    $li.id = roomId;
    $li.appendChild($a);
    $roomList.appendChild($li);
  }
  removeRoom(roomId) {
    document.querySelector(`#room-list > #${roomId}`).remove();
  }

  addChat({ message, nickname }) {
    const $chatList = document.getElementById('chat-list');
    const text = `${nickname}: ${message}`;
    let className = 'chat';
    if (nickname === 'system') className = 'system';
    if (nickname === 'me') className += ' me';
    const $chat = createLiWithClass(text, className);
    $chatList.appendChild($chat);
  }
}
new App();
