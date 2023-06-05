"use strict";

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: "Steven Thomas Williams",
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: "Sarah Smith",
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

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
let currentAccount;

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
  displayMovements(currentAccount.movements);
  displayCurrentBalance(currentAccount);
  displayAccountSummary(currentAccount);
};

// MAIN PAGE LOAD

const resetMovements = function () {
  containerMovements.innerHTML = "";
};

const displayMovements = function (movements, sort = false) {
  resetMovements();

  const movementsSorted = sort
    ? movements.slice().sort((a, b) => a - b)
    : movements;

  movementsSorted.forEach(function (mov, index) {
    const movementType = mov > 0 ? "deposit" : "withdrawal";
    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${movementType}">
        ${index + 1} ${movementType}
      </div>
      <div class="movements__value">${mov}€</div>
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
  labelBalance.textContent = `${balance} €`;
};

const displayAccountSummary = function (account) {
  const incomes = account.movements
    .filter((mov) => mov > 0)
    .reduce((acc, curr) => acc + curr);

  const outcomes = account.movements
    .filter((mov) => mov < 0)
    .reduce((acc, curr) => acc + curr);

  const interests = account.movements
    .filter((mov) => mov > 0)
    .map((mov) => (mov * account.interestRate) / 100)
    .filter((interest) => interest >= 1)
    .reduce((acc, curr) => acc + curr);

  labelSumIn.textContent = `${incomes}€`;
  labelSumOut.textContent = `${Math.abs(outcomes)}€`;
  labelSumInterest.textContent = `${interests}€`;
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
    receiverAccount.movements.push(amount);

    inputTransferTo.value = inputTransferAmount.value = "";

    updateUI(currentAccount);
  }
});

// LOAN

btnLoan.addEventListener("click", function (e) {
  e.preventDefault();
  const amount = Number(inputLoanAmount.value);

  if (
    amount > 0 &&
    currentAccount.movements.some((mov) => mov >= amount * 0.1)
  ) {
    currentAccount.movements.push(amount);

    updateUI(currentAccount);

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
  displayMovements(currentAccount.movements, sorted);
});
