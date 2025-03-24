import './App.css';
import React, { useEffect, useState, useCallback } from 'react';


function App() {

  const [name, setName] = useState('');
  const [datetime, setDatetime] = useState('');
  const [description, setDescription] = useState('');
  const [transactions, setTransactions] = useState([]);

  const [username, setUsername] = useState(localStorage.getItem('username') || '');

  const [password, setPassword] = useState('');

  const [user, setUser] = useState(null);



  useEffect(() => {
    if (!username) return; // Prevent fetching if user is not logged in


    fetch(`http://localhost:4040/api/transactions/${username}`)
      .then((response) => response.json())
      .then((data) => {

        setTransactions(data);
      })
      .catch((error) => console.error("Fetch error:", error));
  }, [username]);





  const getTransactions = useCallback(async () => {
    if (!username) return;

    try {
      const response = await fetch(`http://localhost:4040/api/transactions/${username}`);
      if (!response.ok) throw new Error("Failed to fetch transactions");

      const data = await response.json();
      console.log("Fetched transactions:", data); // Debugging
      setTransactions(data);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }, [username]); // ✅ Memoize function based on username

  useEffect(() => {
    getTransactions(); // ✅ Function is now stable and doesn't cause warnings
  }, [getTransactions]);


  async function handleSignup(ev) {
    ev.preventDefault();
    const response = await fetch(`${process.env.REACT_APP_API_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    if (response.ok) {
      alert('Signup successful! Please log in.');
    } else {
      alert(data.error);
    }
  }

  async function handleLogin(ev) {
    ev.preventDefault();

    console.log("Logging in with:", username, password); // Debugging

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || "Invalid username or password!"); // 🚨 Show alert on failure
        throw new Error(errorData.error || "Login failed");
      }

      const data = await response.json();
      localStorage.setItem("username", data.username);
      setUser({ username: data.username });

    } catch (error) {
      console.error("Login Error:", error);
    }
  }


  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:4040/api/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        localStorage.removeItem("username"); // Clear stored user data
        window.location.href = "/login"; // Redirect to login page
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };









  function addNewTransaction(ev) {
    ev.preventDefault();
    const priceStr = name.split(' ')[0];
    const Price = parseFloat(priceStr);
    if (isNaN(Price)) {
      alert("Invalid price! Please enter in valid number format at the beginning.");
      return;
    }

    // Validate name
    const itemName = name.substring(priceStr.length + 1).trim();
    if (!itemName) {
      alert("Item name is required!");
      return;
    }

    // Validate datetime
    if (!datetime) {
      alert("Please select a valid date and time.");
      return;
    }
    const url = process.env.REACT_APP_API_URL + '/transaction';

    const price = name.split(' ')[0];
    fetch(url, {
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify({
        username,
        price,
        name: name.substring(price.length + 1),
        description,
        datetime
      })
    }).then(response => {
      response.json().then(json => {
        setName('');
        setDatetime('');
        setDescription('');
        setTransactions([...transactions, json]);



        // console.log('result', json);
      });
    });

  }
  let balance = 0;
  for (const transaction of transactions) {
    balance = balance + transaction.price;
  }

  return (
    <main>
      {
        !user ? (
          <>
            <h1>Track Your Transactions</h1>
            <h2>Login or Signup</h2>
            <form onSubmit={handleLogin}>
              <input type="text" value={username} onChange={ev => setUsername(ev.target.value)} placeholder="Username" />
              <input type="password" value={password} onChange={ev => setPassword(ev.target.value)} placeholder="Password" />
              <button type="submit">Login</button>
            </form>
            <h2>or</h2>
            <form onSubmit={handleSignup}>
              <input type="text" value={username} onChange={ev => setUsername(ev.target.value)} placeholder="Username" />
              <input type="password" value={password} onChange={ev => setPassword(ev.target.value)} placeholder="Password" />
              <button type="submit">Signup</button>
            </form>

          </>

        ) : (
          <>
            <h1>{user && user.username} Money Tracker</h1>
            <button onClick={handleLogout}>Logout</button>
            <h2>CURRENT BALANCE: <span>Rs{balance}</span></h2>
            <div className='instruction'><b>Instruction</b>: Please follow the given format for price input.The format ensures smooth functioning of the app.
              <div>1. Add a + or - based on a credit or debit from your account and add the amount without giving a space.</div>
              <div>2.Give a space and add the item name.</div>
              Thank You..Happy Tracking!!
            </div>
            <form onSubmit={addNewTransaction}>
              <div className="basic">
                <input type="text"
                  value={name}
                  onChange={ev => setName(ev.target.value)}
                  placeholder="+/- {price} {item name}" />
                <input type="datetime-local"
                  value={datetime}
                  onChange={ev => setDatetime(ev.target.value)} />
              </div>
              <div className="description">
                <input type="text"
                  value={description}
                  onChange={ev => setDescription(ev.target.value)} placeholder="Description" />
              </div>
              <button type="submit">Add new transaction</button>

            </form>

            <div className="transactions">
              {transactions.length > 0 && transactions.map(transaction => (
                <div className="transaction" key={transaction._id || transaction.name}>
                  <div className="left">
                    <div className="name">{transaction.name}</div>
                    <div className="description">{transaction.description}</div>
                  </div>
                  <div className="right">
                    <div className={"price " + (transaction.price < 0 ? 'red' : 'green')}>{transaction.price}</div>
                    <div className="datetime">{new Date(transaction.datetime).toLocaleString()}</div>
                  </div>
                </div>

              )

              )}



            </div></>

        )

      }


    </main>

  );
}

export default App;