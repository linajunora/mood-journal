import { getData, postData } from "./services.js";  

const usernameInput = document.querySelector('#username');
const passwordInput = document.querySelector('#password');
const error = document.querySelector('#error');

const btnCreateUser = document.querySelector('#createUser');
const btnLogin = document.querySelector('#login');

//checks if a user was just created, and if so updates the p
if (localStorage.getItem('createdUser') === 'true') {
    error.classList.remove('hidden');
    error.classList.add('success');
    error.innerText = 'User Successfully Created';
    localStorage.removeItem('createdUser');
}

const createUser = async() => {
    const username = usernameInput.value;
    const password = passwordInput.value;
    error.classList = '';
    error.classList.add('hidden');


    //validate input before making API requests
    if (username.length < 3) {
        error.innerText = 'Username must be at least 3 chars long';
        error.classList.remove('hidden');
    } else if (password.length < 6){
        error.innerText = 'Password must be at least 6 chars long';
        error.classList.remove('hidden');
    } else {
        //input is valid, now check if username exists
        const userData = await getData('http://localhost:5555/users', { username });

        if (userData.length > 0) {
            error.innerText = 'Username already taken';
            error.classList.remove('hidden');
        } else {
            //cretate user
            const response = await postData('http://localhost:5555/users', {
                username,
                password,
              });

              console.log(`created user: ${username}`);

              if(!response) {
                error.classList.remove('hidden');
                error.innerText = 'Something went wrong, try again';
              } else {
                error.classList.remove('hidden');
                error.innerText = 'User successfully created';
                error.classList.add('success');
                localStorage.setItem('createdUser', 'true');
              }
        }
    }
}
btnCreateUser.addEventListener('click', createUser);

const login = async() => {
    const username = usernameInput.value;
    const password = passwordInput.value;
    error.classList = '';
    error.classList.add('hidden');
    try {
        const userData = await getData('http://localhost:5555/users', { username });

        //takes the array of users from userData (probs only one but [0] takes the first one)
        if(userData[0] && userData[0].username === username && userData[0].password === password){
            
            //saves the user ID in sessionStorage
            //helpful to identify which user is using the app as you move through different pages.
            sessionStorage.setItem('userId', userData[0].id);
            sessionStorage.setItem('username', userData[0].username);
            error.classList.remove('hidden');
            error.innerText = 'Login successfull!';
            error.classList.add('success');
            console.log(`Logged in as ${userData[0].username}, userId: ${userData[0].id}`);

            setTimeout(() => {
                window.location.href = "html/userStart.html";
            }, 2000);
        } else {
            error.classList.remove('hidden');
            error.innerText = 'Wrong username or password';
        }
    } catch(error) {
        console.error('Something went wrong:', error);
    }
}
btnLogin.addEventListener('click', login);