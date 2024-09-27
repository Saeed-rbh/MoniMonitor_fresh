import "./App.css";
import React, { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { fetchTransactions } from "./Tools/transactionService";
import ErrorBoundary from "./ErrorBoundary";

const MainMenu = lazy(() => import("./MainMenu/MainMenu"));
const Header = lazy(() => import("./Header/header"));
const Telegram = lazy(() => import("./Telegram/MoneyMonitor"));
const Transactions = lazy(() => import("./Transactions/Transactions"));
const AddTransaction = lazy(() => import("./AddTransaction/AddTransaction"));

const App = () => {
  const useTransactionData = (whichMonth) => {
    const [data, setData] = useState({
      selected: [],
      Availability: [],
      netAmounts: [],
    });

    useEffect(() => {
      const fetchData = async () => {
        const { selected, Availability, netAmounts, transactions } =
          await fetchTransactions({
            whichMonth,
          });

        setData({
          selected: selected,
          Availability: Availability,
          transactions: transactions,
          netAmounts: netAmounts,
        });
      };
      fetchData();
    }, [whichMonth]);

    return data;
  };

  const useMainPageMonth = () => {
    const [mainPageMonth, setMainPageMonth] = useState(0);
    return { mainPageMonth, setMainPageMonth };
  };

  const [userData, setUserData] = useState({
    userId: "",
    userName: "",
    userUsername: "",
    userLanguage: "",
    queryId: "",
  });

  const [sessionata, setSessionData] = useState(null);
  const [authState, setAuthState] = useState(sessionata === null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchUserAttributes();
        setSessionData(data);
      } catch (error) {
        setSessionData(null);
      }
    };
    fetchData();
  }, [authState]);

  useEffect(() => {
    setAuthState(sessionata !== null);
  }, [sessionata, setAuthState]);

  useEffect(() => {
    const initTelegramWebApp = () => {
      if (window.Telegram && window.Telegram.WebApp) {
        const telegram = window.Telegram.WebApp;
        const user = telegram.initDataUnsafe.user;
        const queryId = telegram.initDataUnsafe.query_id;
        if (queryId) {
          setUserData({
            userId: user.id,
            userName: user.first_name,
            userUsername: user.username,
            userLanguage: user.language_code,
            queryId: queryId,
          });
        }
      }
    };
    initTelegramWebApp();
  }, []);

  const [whichMonth, setWhichMonth] = useState(0);
  const monthData = useTransactionData(
    whichMonth,
    userData.userId ? userData.userId : 90260003
  );
  const [isMoreClicked, setIsMoreClicked] = useState(null);
  const [isAddClicked, setIsAddClicked] = useState(null);
  const [isDateClicked, setIsDateClicked] = useState(false);

  const {
    Availability: availabilityData,
    netAmounts: netAmountsData,
    transactions: transactionsData,
  } = useTransactionData(whichMonth);

  const { mainPageMonth, setMainPageMonth } = useMainPageMonth();
  const { selected: mainSelected } = useTransactionData(mainPageMonth);

  // Amplify.configure(awsExports);

  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <Suspense fallback={<div>Loading...</div>}>
            <Header
              userData={userData}
              isDateClicked={isDateClicked}
              setIsDateClicked={setIsDateClicked}
              availabilityData={availabilityData}
              whichMonth={whichMonth}
              setWhichMonth={setWhichMonth}
              setMainPageMonth={setMainPageMonth}
            />
            <MainMenu
              isMoreClicked={isMoreClicked}
              setIsMoreClicked={setIsMoreClicked}
            />
            <Telegram
              isDateClicked={isDateClicked}
              isMoreClicked={isMoreClicked}
              setIsMoreClicked={setIsMoreClicked}
              isAddClicked={isAddClicked}
              setIsAddClicked={setIsAddClicked}
              mainPageMonth={mainPageMonth}
              setMainPageMonth={setMainPageMonth}
              mainSelected={mainSelected}
              Availability={availabilityData}
              netAmountsData={netAmountsData}
              transactions={transactionsData}
              setWhichMonth={setWhichMonth}
            />
            <Routes>
              <Route path="/" element={<div />} />
              <Route
                path="/Transactions"
                element={
                  <Transactions
                    isMoreClicked={isMoreClicked}
                    setIsMoreClicked={setIsMoreClicked}
                    monthData={monthData}
                    whichMonth={whichMonth}
                    setWhichMonth={setWhichMonth}
                    userId={userData.userId}
                    isDateClicked={isDateClicked}
                  />
                }
              />
              <Route
                path="/AddTransaction"
                element={
                  <AddTransaction
                    isAddClicked={isAddClicked}
                    setIsClicked={setIsAddClicked}
                    setIsAddClicked={setIsAddClicked}
                    userId={userData.userId}
                  />
                }
              />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
