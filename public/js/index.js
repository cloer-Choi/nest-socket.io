function init() {
  const SESSION_KEYS = { nickname: 'nickname' };
  const socket = io(`/robby`, { autoConnect: false });

  // DOM elements
  const $login = document.getElementById('login');
  const $loginForm = $login.querySelector('form');
  const $robby = document.getElementById('robby');
  const $h2 = $robby.firstChild;
  const $createRoomForm = $robby.querySelector('form');
  const $roomList = $robby.querySelector('ul');
  const $logOutBtn = $robby.lastChild;

  // DOM elements Init
  let isLoggedIn =
    sessionStorage.getItem(SESSION_KEYS.nickname) !== null &&
    sessionStorage.getItem(SESSION_KEYS.nickname) !== '';

  $login.hidden = isLoggedIn;
  $robby.hidden = !isLoggedIn;
  $h2.innerText = isLoggedIn
    ? `Hello, ${sessionStorage.getItem(SESSION_KEYS.nickname)}!`
    : '';

  // DOM functions
  const login = (nickname) => {
    $h2.innerText = `Hello, ${nickname}!`;
    sessionStorage.setItem(SESSION_KEYS.nickname, nickname);
    $login.hidden = true;
    $robby.hidden = false;
    socket.connect();
  };
  const logOut = () => {
    $h2.innerText = '';
    $login.hidden = false;
    $robby.hidden = true;
    sessionStorage.removeItem(SESSION_KEYS.nickname);
    socket.disconnect();
  };
  const addRoom = (roomId, roomName) => {
    const $a = document.createElement('a');
    $a.innerText = roomName;
    $a.href = `/rooms/${roomName}`;
    const $li = document.createElement('li');
    $li.id = roomId;
    $li.appendChild($a);
    $roomList.appendChild($li);
  };
  const removeRoom = (roomId) => {
    const $selectedLi = document.getElementById(roomId);
    if ($roomList.hasChildNodes($selectedLi)) $selectedLi.remove();
  };

  // DOM eventListener
  $loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const input = this.querySelector('input');
    const nickname = input.value;
    input.value = '';
    login(nickname);
  });

  $logOutBtn.addEventListener('click', logOut);

  $createRoomForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const input = this.querySelector('input');
    const roomName = input.value;
    input.value = '';

    socket.emit('create_room', { roomName }, ({ roomId }) => {
      addRoom(roomId, roomName);
    });
  });

  // Socket Init
  if (isLoggedIn) socket.connect();

  // Socket Events
  socket.onAny((event, ...args) => {
    console.log(`[ ${event} ]: ${args}`);
  });
  socket.on('create_room', ({ roomId, roomName }) => addRoom(roomId, roomName));
  socket.on('delete_room', ({ roomId }) => removeRoom(roomId));
}
init();
