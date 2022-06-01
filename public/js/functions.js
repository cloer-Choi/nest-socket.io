export const createH2 = (text) => {
  const $h2 = document.createElement('h2');
  $h2.innerText = text;
  return $h2;
};
export const createInput = (placeholder, required = true) => {
  const $input = document.createElement('input');
  $input.placeholder = placeholder;
  $input.required = required;
  return $input;
};
export const createButton = (text) => {
  const $button = document.createElement('button');
  $button.innerText = text;
  return $button;
};
export const createForm = (childrenList, submitHandler) => {
  const $form = document.createElement('form');
  $form.append(...childrenList);
  $form.addEventListener('submit', submitHandler);
  return $form;
};
export const createUlWithId = (id) => {
  const $ul = document.createElement('ul');
  $ul.id = id;
  return $ul;
};
export const createLiWithClass = (text = '', className = '') => {
  const $li = document.createElement('li');
  if (className !== '') $li.innerText = text;
  if (className !== '') $li.classList.add(className);
  return $li;
};
