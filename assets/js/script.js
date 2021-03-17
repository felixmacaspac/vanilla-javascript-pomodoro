const timer = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 4,
  session: 0,
};

const pomodoroSound = document.getElementById('pomodoro-sound')
const endingSound = document.getElementById('ending-sound')

let interval;


const mainButton = document.getElementById('js-btn');
mainButton.addEventListener('click', () => {
  const { action } = mainButton.dataset;
  if (action === 'start') {
    startTimer();
    pomodoroSound.play()
  } else {
    stopTimer();
    pomodoroSound.play()
  }
});

const modeButtons = document.querySelector('#js-mode-buttons');
modeButtons.addEventListener('click', handleMode);

function getRemainingTime(endTime) {
  const currentTime = Date.parse(new Date());
  const difference = endTime - currentTime;

  const total = Number.parseInt(difference / 1000, 10);
  const minutes = Number.parseInt((total / 60) % 60, 10);
  const seconds = Number.parseInt(total % 60, 10);

  return {
    total,
    minutes,
    seconds,
  };
}
// function for starting the timer
function startTimer() {
  let { total } = timer.remainingTime;
  const endTime = Date.parse(new Date()) + total * 1000;
  
  
  mainButton.dataset.action = 'stop';
  mainButton.innerHTML = `<i class="fas fa-pause"></i>`;
  mainButton.classList.add('stop-button-active');

  if (timer.mode === 'pomodoro') timer.sessions++;

  // adding the notication for every session
  if (Notification.permission === 'granted') {
    const text =
      timer.mode === 'pomodoro' ? 'Get back to work!' : 'Take a break!';
    new Notification(text);
  }

  interval = setInterval(function() {
    timer.remainingTime = getRemainingTime(endTime);
    updateClock();
    total = timer.remainingTime.total;
    if (total <= 0) {
      clearInterval(interval);

      // automatically starts the next session 
      switch (timer.mode) {
        case 'pomodoro':
          if (timer.sessions % timer.longBreakInterval === 0) {
            switchMode('longBreak');
            pomodoroSound.play()
            endingSound.play()
          } else {
            switchMode('shortBreak');
            pomodoroSound.play()
            endingSound.play()
          }
          break;
        default:
          switchMode('pomodoro');
          pomodoroSound.play()
      }
      startTimer();
    }
  }, 1000);
}

// Function for stopping the timer
function stopTimer() {
  clearInterval(interval);

  mainButton.dataset.action = 'start';
  mainButton.innerHTML = `<span><i class="fas fa-play"></i> </span>`;
  mainButton.classList.remove('stop-button-active')
}
// Updating the Timer
function updateClock() {
  const { remainingTime } = timer;
  const minutes = `${remainingTime.minutes}`.padStart(2, '0');
  const seconds = `${remainingTime.seconds}`.padStart(2, '0');

  const min = document.getElementById('js-minutes');
  const sec = document.getElementById('js-seconds');
  min.textContent = minutes;
  sec.textContent = seconds;
  // Connecting the time to title
  const text = timer.mode === 'pomodoro' ? 'Get back to work!' : 'Take a break!';
  document.title = `${minutes}:${seconds} - ${text}`;
}
// Updating the timer
function switchMode(mode) {
  timer.mode = mode;
  timer.remainingTime = {
    total: timer[mode] * 60,
    minutes: timer[mode],
    seconds: 0,
  };

  // Changing Background
  const buttonDataMode = document.querySelectorAll('button[data-mode]')
  buttonDataMode.forEach(e => {
    e.classList.remove('active')
  });
  document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
  document.body.style.backgroundColor = `var(--${mode})`;

  updateClock();
}

// Handling events
function handleMode(event) {
  const { mode } = event.target.dataset;
  if (!mode) return;

  switchMode(mode);
  stopTimer();
}

// notification permission
document.addEventListener('DOMContentLoaded', () => {
  if ('Notification' in window) {
    if (
      Notification.permission !== 'granted' &&
      Notification.permission !== 'denied'
    ) {
      Notification.requestPermission().then(function(permission) {
        if (permission === 'granted') {
          new Notification(
            'Awesome! You will be notified at the start of each session'
          );
        }
      });
    }
  }
  

  switchMode('pomodoro');
});


