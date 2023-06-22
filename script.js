"use strict";

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-01-28T09:15:04.904Z",
    "2020-04-01T10:17:24.185Z",
    "2020-05-08T14:11:59.604Z",
    "2020-05-27T17:01:17.194Z",
    "2020-07-11T23:36:17.929Z",
    "2020-07-12T10:51:36.790Z",
  ],
  currency: "EUR",
  locale: "pt-PT", // de-DE
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-12-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2020-02-05T16:33:06.386Z",
    "2020-04-10T14:43:26.374Z",
    "2020-06-25T18:49:59.371Z",
    "2020-07-26T12:01:20.894Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

let inputLoginUsername = document.querySelector(".login__input--user");
let inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

///////////////////////////////////////////////////////////////////////////////////////////

// START OF APPLICATION
const setUsernames = function (users) {
  users.forEach(function (user) {
    user.username = user.owner
      .toLowerCase()
      .split(" ")
      .map((value) => value[0])
      .join("");
  });
};

setUsernames(accounts);

// LOGIN
let currentAccount, timer;

btnLogin.addEventListener("click", function (event) {
  // Prevens the reload of the page when the button is triggered.
  event.preventDefault();

  currentAccount = accounts.find(
    (acc) => acc.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    inputLoginUsername.value = inputLoginPin.value = "";

    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(" ")[0]
    }`;
    containerApp.style.opacity = 1;

    resetMovements();
    updateUI(currentAccount);
  }
});

const updateUI = function (currentAccount) {
  clearInterval(timer);
  timer = startLogoutTimer();
  setCurrentDateTime();
  displayMovements(currentAccount);
  colorEvenRow();
  displayCurrentBalance(currentAccount);
  displayAccountSummary(currentAccount);
};

// MAIN PAGE LOAD

const resetMovements = function () {
  containerMovements.innerHTML = "";
};

const displayMovements = function (account, sort = false) {
  resetMovements();

  const movementsSorted = sort
    ? account.movements.slice().sort((a, b) => a - b)
    : account.movements;

  movementsSorted.forEach(function (mov, index) {
    const movementType = mov > 0 ? "deposit" : "withdrawal";
    const movementDate = currentAccount.movementsDates[index];

    const formattedMov = formatCur(mov);

    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${movementType}">
        ${index + 1} ${movementType}
      </div>
      <div class="movements__date">${calculateTimeAgo(
        new Date(movementDate)
      )}</div>
      <div class="movements__value">${formattedMov}</div>
    </div>`;
    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

const displayCurrentBalance = function (account) {
  const balance = account.movements.reduce(
    (accumulator, current) => accumulator + current,
    0
  );
  account.balance = balance;
  const formattedBalance = formatCur(balance);

  labelBalance.textContent = `${formattedBalance}`;
};

const displayAccountSummary = function (account) {
  const incomes = account.movements
    .filter((mov) => mov > 0)
    .reduce((acc, curr) => acc + curr)
    .toFixed(2);

  const outcomes = account.movements
    .filter((mov) => mov < 0)
    .reduce((acc, curr) => acc + curr)
    .toFixed(2);

  const interests = account.movements
    .filter((mov) => mov > 0)
    .map((mov) => (mov * account.interestRate) / 100)
    .filter((interest) => interest >= 1)
    .reduce((acc, curr) => acc + curr)
    .toFixed(2);

  labelSumIn.textContent = `${formatCur(incomes)}`;
  labelSumOut.textContent = `${formatCur(outcomes)}`;
  labelSumInterest.textContent = `${formatCur(interests)}`;
};

// FORMATTED CURRENCY
const formatCur = function (value) {
  return new Intl.NumberFormat(currentAccount.locale, {
    style: "currency",
    currency: currentAccount.currency,
  }).format(value);
};

// CURRENT DATE AND TIME
const setCurrentDateTime = function () {
  const now = new Date();
  const options = {
    hour: "numeric",
    minute: "numeric",
    day: "numeric",
    month: "long",
    year: "numeric",
  };

  labelDate.textContent = new Intl.DateTimeFormat(
    currentAccount.locale,
    options
  ).format(now);
};

// FORMATTING DATES

const formatDate = function (date, withHours = false) {
  const day = `${date.getDate()}`.padStart(2, 0);
  const month = `${date.getMonth() + 1}`.padStart(2, 0);
  const year = date.getFullYear();

  let dateToShow = `${day}/${month}/${year}`;

  if (withHours) {
    const hour = `${date.getHours()}`.padStart(2, 0);
    const minutes = `${date.getMinutes()}`.padStart(2, 0);
    dateToShow += `, ${hour}:${minutes}`;
  }

  return dateToShow;
};

// CALCULATION DAYS, MONTH, YEARS AGO

const calculateTimeAgo = function (date) {
  const now = new Date();

  const difference = Math.abs(now - date) / (1000 * 60 * 60 * 24);
  let message = "";

  if (difference < 1) {
    message = "TODAY";
  } else if (difference === 1) {
    message = "YESTERDAY";
  } else if (difference > 1 && difference < 7) {
    message = `${Math.floor(difference)} DAYS AGO`;
  } else {
    message = formatDate(date);
  }

  /*else if (difference >= 30) {
    const monthsAgo = Math.abs(Math.floor(difference) / 30);
    if (monthsAgo < 12) {
      message = `${monthsAgo} MONTHS AGO`;
    } else {
      message = `${Math.floor(monthsAgo / 12)} YEARS AGO`;
    }
  }*/

  return message;
};

// TRANSFER

btnTransfer.addEventListener("click", function (e) {
  e.preventDefault();

  const amount = Number(inputTransferAmount.value);
  const receiverAccount = accounts.find(
    (acc) => acc.username === inputTransferTo.value
  );

  if (
    amount > 0 &&
    currentAccount.balance >= amount &&
    receiverAccount.username !== currentAccount?.username
  ) {
    currentAccount.movements.push(-amount);
    currentAccount.movementsDates.push(new Date().toISOString());

    receiverAccount.movements.push(amount);
    receiverAccount.movementsDates.push(new Date().toISOString());

    inputTransferTo.value = inputTransferAmount.value = "";

    setTimeout(() => {
      updateUI(currentAccount);
    }, 2000);
  }
});

// LOAN

btnLoan.addEventListener("click", function (e) {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);

  if (
    amount > 0 &&
    currentAccount.movements.some((mov) => mov >= amount * 0.1)
  ) {
    currentAccount.movements.push(amount);
    currentAccount.movementsDates.push(new Date().toISOString());

    setTimeout(() => {
      updateUI(currentAccount);
    }, 2000);

    inputLoanAmount.value = "";
  }
});

// CLOSE ACCOUNT

btnClose.addEventListener("click", function (e) {
  e.preventDefault();

  const accountToBeDeleted = accounts.find(
    (acc) => acc.username === inputCloseUsername.value
  );

  if (
    accountToBeDeleted.username === currentAccount.username &&
    accountToBeDeleted.pin === Number(inputClosePin.value)
  ) {
    const accountIndex = accounts.findIndex(
      (acc) => acc.username === currentAccount.username
    );

    accounts.splice(accountIndex, 1);

    containerApp.style.opacity = 0;
    labelWelcome.textContent = "Log in to get started";
    currentAccount = null;
  }

  inputCloseUsername.value = inputClosePin.value = "";
});

// SORT BUTTON

let sorted = false;
btnSort.addEventListener("click", function (e) {
  e.preventDefault();
  sorted = !sorted;
  displayMovements(currentAccount, sorted);
});

// COLOR EVEN ROW

const colorEvenRow = function () {
  [...document.querySelectorAll(".movements__row")].forEach(function (row, i) {
    if (i % 2 === 0) {
      row.style.backgroundColor = "#E8E8E8";
    }
  });
};

// UPDATE TIME

setInterval(setCurrentDateTime, 1000 * 60);

// TIMER LOGOUT

const startLogoutTimer = function () {
  let time = 300;
  let min, sec;

  const tick = function () {
    min = String(Math.trunc(time / 60)).padStart(2, 0);
    sec = String(time % 60).padStart(2, 0);
    labelTimer.textContent = `${min}:${sec}`;
    time--;

    if (time < 0) {
      clearInterval();
      labelWelcome.textContent = "Log in to get started";
      containerApp.style.opacity = 0;
    }
  };

  tick();
  return setInterval(tick, 1000);
};

// ALWAYS ON USER (HACK)
/*inputLoginUsername.value = "js";
inputLoginPin.value = "1111";
btnLogin.click();*/
