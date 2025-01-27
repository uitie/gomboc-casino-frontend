import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { toast } from 'react-toastify';

// GraphQL Queries and Mutations
const GET_USER = gql`
  query {
    user {
      id
      balance
      bets {
        id
        amount
        diceNumber
        result
        timestamp
      }
      message
    }
  }
`;

const PLACE_BET = gql`
  mutation PlaceBet($amount: Int!, $diceNumber: Int!) {
    placeBet(amount: $amount, diceNumber: $diceNumber) {
      id
      amount
      diceNumber
      result
      timestamp
      message
    }
  }
`;

const WITHDRAW = gql`
  mutation {
    withdraw {
      id
      balance
      bets {
        id
        amount
        diceNumber
        result
        timestamp
      }
      message
    }
  }
`;

const GET_BETS = gql`
  query {
    bets {
      id
      amount
      diceNumber
      result
      timestamp
    }
  }
`;

const Home = () => {
  const { loading, error, data, refetch } = useQuery(GET_USER);
  const [placeBet] = useMutation(PLACE_BET);
  const [withdraw] = useMutation(WITHDRAW);
  const { data: betsData, refetch: refetchBets } = useQuery(GET_BETS);

  const [amount, setAmount] = useState<number>(0);
  const [diceNumber, setDiceNumber] = useState<number>(1);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const user = data.user;

  const handlePlaceBet = async () => {
    try {
      const { data } = await placeBet({
        variables: { amount: amount, diceNumber: diceNumber },
      });
      toast.success(`You ${data.placeBet.result}!`);
      if (data.placeBet.message) {
        toast.info(data.placeBet.message);
      }
      refetch();
      refetchBets();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleWithdraw = async () => {
    try {
      const { data } = await withdraw();
      toast.success(data.withdraw.message);
      refetch();
      refetchBets();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  return (
    <div className="container">
      <h1>Gomboc Gambling Casino</h1>
      <div className="balance">
        <h2>Balance: ${user.balance}</h2>
        {user.message && <p>{user.message}</p>}
      </div>

      <div className="bet-form">
        <input
          type="number"
          placeholder="Amount to bet"
          value={amount}
          onChange={(e) => setAmount(parseInt(e.target.value))}
        />
        <input
          type="number"
          placeholder="Dice Number (1-6)"
          min="1"
          max="6"
          value={diceNumber}
          onChange={(e) => setDiceNumber(parseInt(e.target.value))}
        />
        <button onClick={handlePlaceBet}>Submit Bet</button>
      </div>

      <div className="actions">
        <button
          onClick={handleWithdraw}
          disabled={
            user.bets.filter((bet: any) => bet.result === 'win').length === 0
          }
        >
          Withdraw
        </button>
        <button onClick={toggleHistory}>
          {showHistory ? 'Hide History' : 'Show History'}
        </button>
      </div>

      {showHistory && (
        <div className="history">
          <h3>Bet History</h3>
          {betsData.bets.length === 0 ? (
            <p>No bets placed yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Amount</th>
                  <th>Dice Number</th>
                  <th>Result</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {betsData.bets.map((bet: any) => (
                  <tr key={bet.id}>
                    <td>{bet.id}</td>
                    <td>${bet.amount}</td>
                    <td>{bet.diceNumber}</td>
                    <td>{bet.result}</td>
                    <td>{new Date(bet.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <style jsx>{`
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          text-align: center;
          font-family: Arial, sans-serif;
        }

        .balance {
          margin-bottom: 20px;
        }

        .bet-form input {
          padding: 10px;
          margin: 5px;
          width: 150px;
        }

        .bet-form button {
          padding: 10px 20px;
          margin: 5px;
        }

        .actions button {
          padding: 10px 20px;
          margin: 10px;
        }

        .history {
          margin-top: 20px;
          text-align: left;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th,
        td {
          border: 1px solid #ddd;
          padding: 8px;
        }

        th {
          background-color: #f2f2f2;
        }
      `}</style>
    </div>
  );
};

export default Home;