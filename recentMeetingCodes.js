const BUTTON_SELECTOR = 'div[role="button"]';
const OPENER_TEXT = 'Join or start a meeting';
const OPENER_TEXT_RESTRICTED = 'Use a meeting code';
const MEETING_CODE_SELECTOR = '[data-keyboard-title="Use a meeting code"]';
const MEETING_CODE_SUBMIT_TEXT = 'Continue';
const STORAGE_KEY = 'recentMeetingCodes';
const MAX_CODES = 15;
const RMC_CONTAINER_CLASS = 'rmc-list';

const getMeetingCodeModalOpener = _ => {
  return Array.from(document.querySelectorAll(BUTTON_SELECTOR)).find(node => (node.innerText.includes(OPENER_TEXT) || node.innerText.includes(OPENER_TEXT_RESTRICTED)));
}

const modalOpener = getMeetingCodeModalOpener();

const launchMeeting = meetingCode => {
  if (modalOpener && modalOpener.click) {
    modalOpener.click();
    setTimeout(submitMeetingCodeForm.bind(this, meetingCode), 250);
  }
}

const getMeetingCodeFormSubmitButton = _ => {
  return Array.from(document.querySelectorAll(BUTTON_SELECTOR)).find(node => node.innerText == MEETING_CODE_SUBMIT_TEXT);
}

const removeLastClass = elem => {
  const lastClass = elem.classList.value.split(" ").pop();
  elem.classList.remove(lastClass);
}

const submitMeetingCodeForm = meetingCode => {
  const meetingCodeInput = document.querySelector(MEETING_CODE_SELECTOR);
  if (meetingCodeInput) {
    meetingCodeInput.value = meetingCode;
    const submitButton = getMeetingCodeFormSubmitButton();
    if (submitButton && submitButton.click) {
      removeLastClass(submitButton);
      submitButton.tabIndex = 0;
      submitButton.removeAttribute("aria-disabled");
      submitButton.click();
    }
  }
}

const removeFromArray = (arr, value) => {
  return arr.filter(item => item != value);
}

const storagePush = value => {
  let codes = getRecentMeetingCodes();
  if (codes.includes(value)) {
    codes = removeFromArray(codes, value);
  }
  // most recent first
  codes.reverse();
  codes.push(value);
  codes.reverse();
  while (codes.length > MAX_CODES) {
    codes.pop();
  }
  localStorage.setItem(STORAGE_KEY, codes.join(","))
}

const saveMeetingCode = _ => {
  const meetingCodeInput = document.querySelector(MEETING_CODE_SELECTOR);
  if (meetingCodeInput) {
    storagePush(meetingCodeInput.value);
    rerenderButtons();
  }
}

const storageRemove = value => {
  let codes = getRecentMeetingCodes();
  if (codes.includes(value)) {
    codes = removeFromArray(codes, value);
    localStorage.setItem(STORAGE_KEY, codes.join(","))
  }
}

const removeMeetingCode = code => {
  const meetingCodeBtn = document.querySelector(`[data-code="${code}"]`);
  meetingCodeBtn.remove();
  storageRemove(code);
}

const handleMeetingCodeKey = e => {
  if (e.code == "Enter") {
    saveMeetingCode();
  }
}

const handleMeetingCodeButtonKey = e => {
  if (e.code == "Space" || e.code == "Enter") {
    saveMeetingCode();
  }
}

const handleMeetingCodeButtonClick = e => {
  saveMeetingCode();
}

const addMeetingCodeSubmitListeners = _ => {
  // when "Enter" is pressed while text input is focused
  const meetingCodeInput = document.querySelector(MEETING_CODE_SELECTOR);
  if (meetingCodeInput) {
    meetingCodeInput.addEventListener("keydown", handleMeetingCodeKey);
  }

  const submitButton = getMeetingCodeFormSubmitButton();
  if (submitButton) {
    // when "Enter" or "Space" is pressed while Continue "button" is focused
    submitButton.addEventListener("keydown", handleMeetingCodeButtonKey);
    // when Continue "button" is clicked
    submitButton.addEventListener("click", handleMeetingCodeButtonClick);
  }
}

const handleModalOpened = e => {
  if (e.type != "keydown" || ((e.type == "keydown") && (e.code == "Space" || e.code == "Enter"))) {
    setTimeout(addMeetingCodeSubmitListeners, 250);
  }
}

const addModalOpenListeners = _ => {
  if (modalOpener && modalOpener.click) {
    modalOpener.addEventListener("click", handleModalOpened);
    modalOpener.addEventListener("keydown", handleModalOpened);
  }
}

addModalOpenListeners();

const getRecentMeetingCodes = _ => {
  const codes = localStorage.getItem(STORAGE_KEY);
  if (codes) {
    return codes.split(",");
  }
  return [];
}

const createMeetingCodeButton = code => {
  const div = document.createElement("div");
  div.dataset.code = code;
  div.classList.add("rmc-button");
  const btn = document.createElement("button");
  btn.classList.add("rmc-button__launch")
  btn.innerText = code;
  btn.title = "Launch Meet Code " + code;
  btn.addEventListener("click", launchMeeting.bind(this, code));
  const remove = document.createElement("button");
  remove.classList.add("rmc-button__remove");
  const removeSpan = document.createElement("span");
  removeSpan.innerText = "Remove Meet Code";
  removeSpan.classList.add("rmc-visuallyhidden");
  remove.title = "Remove Meet Code " + code;
  remove.addEventListener("click", removeMeetingCode.bind(this, code));
  remove.appendChild(removeSpan);
  div.appendChild(btn);
  div.appendChild(remove);

  return div;
}

const addRecentMeetingCodes = _ => {
  const codes = getRecentMeetingCodes();
  const list = document.createElement("div");
  list.classList.add(RMC_CONTAINER_CLASS);
  const heading = document.createElement("h2");
  if (codes.length == 0) {
    heading.innerText = "Recently used Meeting Codes will appear here";
  } else {
    heading.innerText = "Recently used Meeting Codes:";
  }
  list.appendChild(heading);
  codes.forEach(code => {
    list.appendChild(createMeetingCodeButton(code));
  });
  document.body.appendChild(list);
}

const rerenderButtons = _ => {
  document.querySelector(`.${RMC_CONTAINER_CLASS}`).remove();
  addRecentMeetingCodes();
}

addRecentMeetingCodes();